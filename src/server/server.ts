/* eslint-disable @typescript-eslint/explicit-function-return-type */
import express from 'express'
import { getPayloadClient } from './get-payload'
import { nextApp, nextHandler } from './next-utils'
import * as trpcExpress from '@trpc/server/adapters/express'
import { appRouter } from '../trpc'
import { type inferAsyncReturnType } from '@trpc/server'

const app = express()
const PORT = Number(process.env.PORT) ?? 3400
const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => ({
  req, res
})

export type ExpressContext = inferAsyncReturnType<typeof createContext>

async function start (): Promise<any> {
  const payload = await getPayloadClient({
    initOptions: {
      express: app,
      onInit: async (cms) => {
        cms.logger.info(`Admin URL ${cms.getAdminURL()} `)
      }
    }
  })

  app.use('/api/trpc', trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext

  }))
  app.use(async (req, res) => { await nextHandler(req, res) })

  nextApp.prepare().then(() => {
    payload.logger.info('Next.js started')

    app.listen(PORT, () => {
      payload.logger.info(
      `Next.js App URL ${process.env.NEXT_PUBLIC_SERVER_URL}`)
    })
  }).catch(err => { console.log(err) })
}

start().catch((err) => { console.log(err) })
