import { z } from 'zod'
import { authRouter } from './auth-router'
import { publicProcedure, router } from './trpc'
import { QueryValidatorSchema } from '../lib/zod-schemas'
import { getPayloadClient } from '../server/get-payload'
import { paymentRouter } from './payment-router'

export const appRouter = router({
  auth: authRouter,
  payment: paymentRouter,
  // GET ALL PRODUCTS
  getInfiniteProducts: publicProcedure.input(z.object({
    limit: z.number().min(1).max(100),
    cursor: z.number().nullish(),
    query: QueryValidatorSchema
  }))
    .query(async ({ input }) => {
      const { query, cursor } = input
      const { sort, limit, ...queryOptions } = query

      const payload = await getPayloadClient({})
      const parseQueryOptions: Record<string, { equals: string }> = {}

      Object.entries(queryOptions)
        .forEach(([key, value]) => {
          parseQueryOptions[key] = { equals: value }
        })
      const page = cursor ?? 1

      const { docs: items, nextPage, hasNextPage } = await payload.find({
        collection: 'products',
        where: {
          approvedForSale: {
            equals: 'approved'

          },
          ...parseQueryOptions
        },
        sort,
        depth: 1,
        limit,
        page
      })

      return { items, nextPage: hasNextPage ? nextPage : null }
    })

})

export type AppRouter = typeof appRouter
