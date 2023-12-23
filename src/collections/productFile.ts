import { type Product } from '../server/payload-types'
import { type AccessResult } from 'payload/config'
import { type BeforeChangeHook } from 'payload/dist/collections/config/types'
import { type Access, type CollectionConfig } from 'payload/types'

const addUser: BeforeChangeHook = ({ req, data }) => {
  return { ...data, user: req.user?.id }
}

const yourOwnOrPurchased: Access = async ({ req }): Promise<AccessResult> => {
  const user = req.user
  if (user.role === 'admin') return true
  if (!user) return false

  const { docs: products } = await req.payload.find({
    collection: 'products',
    depth: 0,
    where: { user: { equals: user.id } }
  })
  const ownProductFilesIds = products.map((prod) => prod.product_files).flat()

  const { docs: orders } = await req.payload.find({
    collection: 'orders',
    depth: 2,
    where: { user: { equals: user.id } }
  })
  const purchasedProductsFileIds = orders.map((order) => {
    return order?.products.map< string[] | Product[]>((product: any) => {
      if (typeof product === 'string') {
        req.payload.logger.error('Search depth not sufficient to find file ids'); return false
      }

      return typeof product.product_files === 'string'
        ? product.product_files
        : product.product_files.id
    })
  }).filter(Boolean)
    .flat()

  return {
    id: {
      in: [...ownProductFilesIds, ...purchasedProductsFileIds]
    }
  }
}

export const ProductFiles: CollectionConfig = {
  slug: 'product_files',
  admin: {
    hidden: ({ user }) => user.role !== 'admin'
  },
  hooks: {
    beforeChange: [addUser]
  },
  access: {
    read: yourOwnOrPurchased,
    update: ({ req }) => req.user.role === 'admin',
    delete: ({ req }) => req.user.role === 'admin'
  },
  upload: {
    staticURL: '/products_files',
    staticDir: 'products_files',
    mimeTypes: ['image/*', 'font/*', 'application/postscripts']
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        condition: () => false
      },
      hasMany: false,
      required: true
    }
  ]

}
