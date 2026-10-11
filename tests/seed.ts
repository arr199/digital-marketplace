// Wipes the test database and uploads folder, then seeds known users, products and an order.
// Run with tsx (see global-setup.ts) so it uses the real Payload config and hooks.
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import { getPayload } from 'payload'
import { assertSafeTestEnv, PRODUCTS, USERS } from './test-env'

const FIXTURES = path.resolve(process.cwd(), 'tests/fixtures')
const SEED_OUTPUT = path.resolve(process.cwd(), 'tests/.auth/seed.json')

async function seed (): Promise<void> {
  assertSafeTestEnv(process.env)

  fs.rmSync(path.resolve(process.cwd(), '.test-uploads'), { recursive: true, force: true })

  // Loaded at runtime so assertSafeTestEnv runs before the config reads any env vars
  const { default: config } = await import(pathToFileURL(path.resolve(process.cwd(), 'payload.config.ts')).href)
  const payload = await getPayload({ config })
  await payload.db.connection.dropDatabase()

  const createUser = async (email: string, password: string, role: 'admin' | 'user'): Promise<any> =>
    await payload.create({
      collection: 'users',
      data: { email, password, role, _verified: true } as any,
      disableVerificationEmail: true
    })

  const admin = await createUser(USERS.admin.email, USERS.admin.password, 'admin')
  const seller = await createUser(USERS.seller.email, USERS.seller.password, 'user')
  const buyer = await createUser(USERS.buyer.email, USERS.buyer.password, 'user')
  const shopper = await createUser(USERS.shopper.email, USERS.shopper.password, 'user')

  const createProduct = async (name: string, approvedForSale: 'approved' | 'pending'): Promise<any> => {
    const image = await payload.create({
      collection: 'media',
      data: {} as any,
      filePath: path.join(FIXTURES, 'product-image.jpg'),
      user: seller
    })
    const file = await payload.create({
      collection: 'product_files',
      data: {} as any,
      filePath: path.join(FIXTURES, 'product-file.jpg'),
      user: seller
    })
    return await payload.create({
      collection: 'products',
      data: {
        name,
        description: `${name} description`,
        price: 12,
        category: 'ui_kits',
        product_files: file.id,
        approvedForSale,
        images: [{ image: image.id }]
      } as any,
      user: seller
    })
  }

  const approvedA = await createProduct(PRODUCTS.approvedA, 'approved')
  const approvedB = await createProduct(PRODUCTS.approvedB, 'approved')
  const pending = await createProduct(PRODUCTS.pending, 'pending')

  const paidOrder = await payload.create({
    collection: 'orders',
    data: { isPaid: true, user: buyer.id, products: [approvedA.id] } as any
  })

  // Log each role in once, sequentially. Payload stores a session per login on the user doc, and
  // parallel tests logging in as the same user race on that array and invalidate each other's tokens.
  const tokens: Record<string, string> = {}
  for (const [role, credentials] of Object.entries(USERS)) {
    const { token } = await payload.login({ collection: 'users', data: credentials })
    tokens[role] = token as string
  }

  fs.mkdirSync(path.dirname(SEED_OUTPUT), { recursive: true })
  fs.writeFileSync(SEED_OUTPUT, JSON.stringify({
    tokens,
    users: { admin: admin.id, seller: seller.id, buyer: buyer.id, shopper: shopper.id },
    products: { approvedA: approvedA.id, approvedB: approvedB.id, pending: pending.id },
    paidOrder: paidOrder.id,
    mediaFile: approvedA.images[0].image.filename ?? null
  }, null, 2))
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
