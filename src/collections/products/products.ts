import API from '../../lib/API'
import { type CollectionConfig } from 'payload/types'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name'
  },
  access: {},
  fields: [
    // USER
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      admin: {
        condition: () => false
      }
    },
    // NAME
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true
    },
    //  DESCRIPTION
    {
      name: 'description',
      type: 'textarea',
      label: 'Product details'
    },
    // PRICE
    {
      name: 'price',
      type: 'number',
      min: 0,
      max: 1000,
      required: true

    },
    // CATEGORY
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: API.PRODUCT_CATEGORIES.map(({ label, value }) => ({ label, value })),
      required: true
    },
    //  PRODUCT_FILES
    {
      name: 'product_files',
      label: 'Products file(s)',
      type: 'relationship',
      relationTo: 'product_files',
      required: true,
      hasMany: false
    },
    // PRODUCT STATUS
    {
      access: {
        create: ({ req }) => req.user.role === 'admin',
        read: ({ req }) => req.user.role === 'admin',
        update: ({ req }) => req.user.role === 'admin'

      },
      name: 'approvedForSale',
      label: 'Product Status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending verification', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Denied', value: 'denied' }
      ]
    },
    // PRICE ID
    {
      name: 'priceId',
      access: {
        create: () => false,
        update: () => false,
        read: () => false
      },
      type: 'text',
      admin: {
        hidden: true
      }

    },
    // STRIPE ID
    {
      name: 'stripeId',
      access: {
        create: () => false,
        update: () => false,
        read: () => false
      },
      type: 'text',
      admin: {
        hidden: true
      }

    },
    //  IMAGES
    {
      name: 'images',
      type: 'array',
      label: 'Product images',
      minRows: 1,
      maxRows: 4,
      labels: {
        singular: 'Image',
        plural: 'Images'
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true
        }
      ]
    }
  ]
}
