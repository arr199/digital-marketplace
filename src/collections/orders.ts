import { type Access, type CollectionConfig } from 'payload/types'

const yourOwn: Access = ({ req: { user } }) => {
  if (user.role === 'admin') return true
  return {
    user: {
      equals: user.id
    }

  }
}

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'Your orders'
    description: 'A summary of all your orders on DigitalHippo'
  },
  access: {
    read: yourOwn
  },
  fields: [
    {
      name: 'isPaid',
      type: 'checkbox',
      access: {
        read: ({ req }) => req.user.role === 'admin',
        create: () => false,
        update: () => false
      },
      admin: {
        hidden: true
      },
      required: true
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        hidden: true
      },
      required: true
    }, {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      admin: {
        hidden: true
      },
      required: true,
      hasMany: true
    }

  ]
}
