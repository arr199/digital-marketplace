/* eslint-disable @typescript-eslint/explicit-function-return-type */
import express from 'express'
import { getPayloadClient } from './get-payload'
import { nextApp, nextHandler } from './next-utils'
import * as trpcExpress from '@trpc/server/adapters/express'
import { appRouter } from '../trpc'
import { type inferAsyncReturnType } from '@trpc/server'
// import bodyParser from 'body-parser'
import { type IncomingMessage } from 'http'
import { stripeWebHookHandler } from '../webhooks/stripeWebHook'
import nextBuild from 'next/dist/build'
import path from 'path'

const app = express()
const PORT = Number(process.env.PORT) ?? 3400
const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => ({
  req, res
})

export type ExpressContext = inferAsyncReturnType<typeof createContext>
export type WebHookRequest = IncomingMessage & { rawBody: Buffer }

async function start (): Promise<void> {
  // const webHookMiddleWare = bodyParser.json({
  //   verify: (req: WebHookRequest, _, buffer) => {
  //     req.rawBody = buffer
  //   }
  // })

  const payload = await getPayloadClient({
    initOptions: {
      express: app,
      onInit: async (cms) => {
        cms.logger.info(`Admin URL ${cms.getAdminURL()} `)
      }
    }
  })

  app.post('/api/webhooks/stripe', stripeWebHookHandler)

  if (process.env.NEXT_BUILD) {
    app.listen(3200, async () => {
      payload.logger.info('NextJS is building for production')
      // @ts-expect-error  ???
      await nextBuild(path.join(__dirname, '../'))
    })
  }

  // TRPC ENDPOINT
  app.use('/api/trpc', trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext
  }))
  // SELF HOSTING NEXTJS APP IN EXPRESS
  app.use(async (req, res) => { await nextHandler(req, res) })

  // STARTING NEXT APP
  nextApp.prepare().then(() => {
    payload.logger.info('Next.js started')

    app.listen(PORT, () => {
      payload.logger.info(
      `Next.js App URL ${process.env.NEXT_PUBLIC_SERVER_URL}`)
    })
  }).catch(err => { console.log(err) })
}

start().catch((err) => { console.log(err) })
