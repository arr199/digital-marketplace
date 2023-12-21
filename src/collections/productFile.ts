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
  const ownProductFiles = products.map((prod) => prod.product_files).flat()

  const { docs: orders } = await req.payload.find({
    collection: 'products',
    depth: 0,
    where: { user: { equals: user.id } }
  })
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
    read: yourOwnOrPurchased
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
