import type { Product } from '@/server/payload-types'

// Storefront queries are public and their results reach the browser: never include the paid files, the seller's
// account or the Stripe ids. Use PUBLIC_PRODUCT_SELECT in the query and PublicProduct in the components, and query at
// depth 1: deeper, each image's `user` relation (the seller's account) gets populated too.
export const PUBLIC_PRODUCT_SELECT = { product_files: false, user: false, priceId: false, stripeId: false } as const

export type PublicProduct = Omit<Product, 'product_files' | 'user' | 'priceId' | 'stripeId'>
