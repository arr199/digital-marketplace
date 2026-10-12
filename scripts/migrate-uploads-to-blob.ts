// One-off: moves the uploads that predate Vercel Blob (files on local disk, docs with no storage `prefix`) into the
// Blob store. Each media / product_files doc gets its own random folder: its file and image sizes go to
// <collection prefix>/<random id>/<filename>, then the doc's `prefix` is set to that folder so Payload reads them from
// there. Random folders keep paid files unguessable in the public store and keep new uploads with the same filename
// (which the storage plugin compares by `prefix` + filename) from colliding with the old ones.
//
// Dry run by default; pass --apply to upload and update the database. Migrated docs have a prefix and are skipped,
// so it is safe to re-run. Docs whose file is missing on disk, or differs from it, are reported and left alone.
//
// Needs BLOB_READ_WRITE_TOKEN in the shell (not in .env / .env.local, where it would switch `pnpm dev` to the real
// Blob store). MONGODB_URL / PAYLOAD_SECRET come from the shell or, when not set there, from .env.
// See docs/deploy-vercel.md.
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import { put } from '@vercel/blob'

const COLLECTIONS = [
  { slug: 'media', prefix: 'media', dir: 'media' },
  { slug: 'product_files', prefix: 'product_files', dir: 'products_files' }
] as const

// Same as the storage plugin's default Cache-Control max-age
const CACHE_CONTROL_MAX_AGE = 60 * 60 * 24 * 365

interface UploadDoc {
  id: string
  filename?: string | null
  filesize?: number | null
  sizes?: Record<string, { filename?: string | null } | undefined> | null
}

function describeDatabase (url: string): string {
  try {
    const { host, pathname } = new URL(url)
    return `${host}${pathname}`
  } catch {
    return '(unparseable MONGODB_URL)'
  }
}

async function main (): Promise<void> {
  const apply = process.argv.includes('--apply')
  // Fills in only what the shell doesn't set (e.g. PAYLOAD_SECRET when MONGODB_URL is given in the shell)
  if (fs.existsSync('.env')) process.loadEnvFile('.env')

  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) throw new Error('BLOB_READ_WRITE_TOKEN is not set. Copy it from Vercel → Storage → your Blob store and set it in this shell.')
  if (!process.env.MONGODB_URL) throw new Error('MONGODB_URL is not set (shell or .env).')
  if (!process.env.PAYLOAD_SECRET) throw new Error('PAYLOAD_SECRET is not set (shell or .env).')

  console.log(`${apply ? 'APPLYING' : 'DRY RUN (pass --apply to execute)'} — database: ${describeDatabase(process.env.MONGODB_URL)}\n`)

  // Loaded after the env is in place. With the token set the storage plugin is enabled, so the
  // `prefix` / `_objectKey` fields exist in the schema.
  const { getPayload } = await import('payload')
  const { sanitizeFilename } = await import('payload/shared')
  const { default: config } = await import(pathToFileURL(path.resolve(process.cwd(), 'payload.config.ts')).href)
  const payload = await getPayload({ config })

  let migrated = 0
  let skipped = 0
  for (const { slug, prefix, dir } of COLLECTIONS) {
    const sourceDir = path.resolve(process.cwd(), process.env.UPLOADS_DIR ?? 'src/server', dir)
    // Legacy docs only: anything uploaded through the plugin has a prefix (and its file is already in Blob)
    const { docs } = await payload.find({
      collection: slug,
      where: { and: [{ prefix: { exists: false } }, { _objectKey: { exists: false } }] },
      depth: 0,
      limit: 0,
      pagination: false
    })

    for (const doc of docs as UploadDoc[]) {
      if (!doc.filename) continue
      const mainFile = path.join(sourceDir, doc.filename)
      if (!fs.existsSync(mainFile)) {
        console.log(`SKIP    ${slug}/${doc.id} ${doc.filename}: file not on disk`)
        skipped++
        continue
      }
      if (typeof doc.filesize === 'number' && fs.statSync(mainFile).size !== doc.filesize) {
        console.log(`SKIP    ${slug}/${doc.id} ${doc.filename}: file on disk differs from the database (size)`)
        skipped++
        continue
      }

      const sizeFiles = Object.values(doc.sizes ?? {}).map((size) => size?.filename).filter((f): f is string => Boolean(f))
      const missingSizes = sizeFiles.filter((f) => !fs.existsSync(path.join(sourceDir, f)))
      if (missingSizes.length > 0) console.log(`WARN    ${slug}/${doc.id}: sizes missing on disk, they will 404: ${missingSizes.join(', ')}`)

      const folder = `${prefix}/${crypto.randomUUID()}`
      const files = [doc.filename, ...sizeFiles.filter((f) => !missingSizes.includes(f))]
      console.log(`${apply ? 'MIGRATE' : 'WOULD  '} ${slug}/${doc.id} → ${folder}/ (${files.join(', ')})`)

      if (apply) {
        // Upload first, then point the doc at the new folder, so it never references files that aren't there
        for (const file of files) {
          await put(`${folder}/${sanitizeFilename(file)}`, fs.readFileSync(path.join(sourceDir, file)), {
            access: 'public',
            addRandomSuffix: false,
            cacheControlMaxAge: CACHE_CONTROL_MAX_AGE,
            token
          })
        }
        // Straight to the database: Payload update hooks on these collections overwrite the doc's owner
        const result = await payload.db.collections[slug].updateOne(
          { _id: doc.id, prefix: { $exists: false } },
          { $set: { prefix: folder } }
        )
        if (result.matchedCount !== 1 || result.modifiedCount !== 1) {
          throw new Error(`${slug}/${doc.id}: database update did not apply (changed meanwhile?). Uploaded files in ${folder}/ are unused.`)
        }
      }
      migrated++
    }
  }

  console.log(`\n${apply ? 'Migrated' : 'Would migrate'} ${migrated} doc(s); skipped ${skipped}.`)
  await payload.destroy()
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  })
