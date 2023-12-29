/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type AfterChangeHook, type BeforeChangeHook } from 'payload/dist/globals/config/types'
import API from '../../lib/API'
import { type Access, type CollectionConfig } from 'payload/types'
import { type Product } from '@/server/payload-types'
import { stripe } from '../../lib/stripe'

const addUser: BeforeChangeHook = ({ req, data }) => {
  const user = req.user
  return { ...data, user: user.id }
}
const adminOrOwner: Access = ({ req }) => {
  if (req.user.role === 'admin') return true

  return {
    user: {
      equals: req.user.id
    }
  }
}

const addProductIdToUserCollection: AfterChangeHook = async ({ req, doc }) => {
  const fullUser = await req.payload.findByID({
    collection: 'users',
    id: req.user.id
  })

  if (fullUser && typeof fullUser === 'object') {
    const { products } = fullUser
    const allIds = [...(products?.map(prod => typeof prod === 'object' ? prod.id : prod)) ?? []]
    const dataToUpdate = [...allIds, doc.id]

    await req.payload.update({
      collection: 'users',
      id: fullUser.id,
      data: { products: dataToUpdate }
    })
  }
}

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name'
  },
  access: {
    read: adminOrOwner,
    update: adminOrOwner,
    delete: adminOrOwner
  },
  hooks: {
    afterChange: [addProductIdToUserCollection as any],
    beforeChange: [
      addUser as any,
      // CREATING THE PRODUCT IN STRIPE AND SAVING THE STRIPE ID AND PRICE ID IN OUR PRODUCT COLLECTION
      async (args) => {
        if (args.operation === 'create') {
          const data = args.data as Product
          const createProduct = await stripe.products.create({
            name: data.name,
            default_price_data: {
              currency: 'USD',
              unit_amount: Math.round(data.price * 100) // the price of the product must be in cents
            }
          })
          const updatedProduct: Product = {
            ...data,
            stripeId: createProduct.id,
            priceId: createProduct.default_price as string // the string price id from stripe
          }
          return updatedProduct
        } else if (args.operation === 'update') {
          const data = args.data as Product

          const updateProduct = await stripe.products.update(data.stripeId ?? '', {
            default_price: data.priceId!
          })
          const updatedProduct: Product = {
            ...data,
            stripeId: updateProduct.id,
            priceId: updateProduct.default_price as string
          }
          return updatedProduct
        }
      }
    ]
  },
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
