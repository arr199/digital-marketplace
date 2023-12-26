import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { slateEditor } from '@payloadcms/richtext-slate'
import { buildConfig } from 'payload/config'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import path from 'path'
import { Users } from '../collections/users'
import { Products } from '../collections/products/products'
import { Media } from '../collections/media'
import { ProductFiles } from '../collections/productFile'
import { Orders } from '../collections/orders'

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL ?? '',
  collections: [Users, Products, Media, ProductFiles, Orders],
  routes: {
    admin: '/sell'
  },
  admin: {
    bundler: webpackBundler(),
    user: 'users',
    meta: {
      titleSuffix: '- DigitalHippo',
      favicon: '/favicon.ico',
      ogImage: '/thumbnail.jpg'
    }
  },

  rateLimit: { max: 2000 },
  editor: slateEditor({}),
  db: mongooseAdapter({ url: process.env.MONGODB_URL ?? '' }),
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts')
  }

})
