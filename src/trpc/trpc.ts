import { getPayloadClient } from '@/server/get-payload'
import { TRPCError, initTRPC } from '@trpc/server'

const t = initTRPC.context<{ headers: Headers }>().create()
const middleware = t.middleware

const isAuth = middleware(async ({ ctx, next }) => {
  const payload = await getPayloadClient()
  const { headers } = ctx
  const { user } = await payload.auth({ headers })

  if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' })

  return await next({
    ctx: {
      user
    }
  })
})

export const router = t.router
export const publicProcedure = t.procedure
export const privateProcedure = t.procedure.use(isAuth)
