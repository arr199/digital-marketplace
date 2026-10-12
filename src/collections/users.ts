import { VerifyEmail } from '../components/emails/verifyEmail'
import { getServerUrl } from '../lib/server-url'
import type { CollectionConfig, Access } from 'payload'

const AdminAndOwner: Access = ({ req }) => {
  const { user } = req
  if (!user) return false
  if (user.role === 'admin') return true

  return {
    id: {
      equals: user.id
    }
  }
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    verify: {
      generateEmailHTML: async ({ token }) => {
        return await VerifyEmail({ token, url: getServerUrl() })
      }
    }

  },

  access: {
    read: AdminAndOwner,
    create: () => true,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin'
  },
  admin: {
    hidden: ({ user }) => user?.role !== 'admin',
    defaultColumns: ['id']
  },
  fields: [
    {
      name: 'products',
      label: 'Products',
      type: 'relationship',
      relationTo: 'products',
      admin: { condition: () => false },
      hasMany: true

    }, {
      name: 'product_ids',
      label: 'Products ids',
      type: 'array',
      admin: { condition: () => true },
      fields: [
        { name: 'id', type: 'text' }
      ]

    },

    {
      name: 'product_files',
      label: 'Product Files',
      type: 'relationship',
      relationTo: 'product_files',
      admin: { condition: () => false },
      hasMany: true

    },
    {
      name: 'role',
      defaultValue: 'user',
      required: true,
      admin: {
        condition: () => true

      },
      access: {
        create: ({ req }) => req.user?.role === 'admin',
        update: ({ req }) => req.user?.role === 'admin'

      },
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' }]

    }
  ]
}
