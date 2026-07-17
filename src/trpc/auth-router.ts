import { AuthCredentialsSchema } from '../lib/zod-schemas'
import { publicProcedure, router } from './trpc'
import { getPayloadClient } from '../server/get-payload'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const authRouter = router({
  createPayloadUser: publicProcedure
    .input(AuthCredentialsSchema)
    .mutation(async ({ input }) => {
      const { email, password } = input
      const payload = await getPayloadClient({})
      const { docs: users } = await payload
        .find({
          collection: 'users',
          where: { email: { equals: email } }
        })
      if (users.length !== 0) {
        throw new TRPCError({ code: 'CONFLICT', message: 'User already exist' })
      }
      await payload.create({
        collection: 'users',
        data: {
          email,
          password,
          role: 'user'
        }
      })
      return { success: true, sentToEmail: email }
    }),
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const { token } = input
      const payload = await getPayloadClient({})
      const isVerified = await payload.verifyEmail({
        collection: 'users',
        token
      })
      if (!isVerified) throw new TRPCError({ code: 'UNAUTHORIZED' })
      return { success: true }
    }),
  loginUser: publicProcedure
    .input(AuthCredentialsSchema)
    .mutation(async ({ input }) => {
      const { email, password } = input

      try {
        const payload = await getPayloadClient({})
        const result = await payload.login({
          collection: 'users',
          data: { email, password }
        })

        if (result.token) {
          return { success: true, token: result.token }
        }

        return { success: true }
      } catch (err) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }
    })

})
