/* eslint-disable @typescript-eslint/explicit-function-return-type */
import express from 'express'
import { getPayloadClient } from './get-payload'
import { nextApp, nextHandler } from './next-utils'
import * as trpcExpress from '@trpc/server/adapters/express'
import { appRouter } from '../trpc'
import { type inferAsyncReturnType } from '@trpc/server'
import { type IncomingMessage } from 'http'
import { stripeWebHookHandler } from '../webhooks/stripeWebHook'
import nextBuild from 'next/dist/build'
import path from 'path'
import { type PayloadRequest } from 'payload/types'

import { parse } from 'url' // eslint-disable-line n/no-deprecated-api

const app = express()
const PORT = Number(process.env.PORT) ?? 3400
const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => ({
  req, res
})

export type ExpressContext = inferAsyncReturnType<typeof createContext>
export type WebHookRequest = IncomingMessage & { rawBody: Buffer }

async function start (): Promise<void> {
  // ENDPOINT TO RECEIVE STRIPE REQUEST
  app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebHookHandler)

  const payload = await getPayloadClient({
    initOptions: {
      express: app,
      onInit: async (cms) => {
        cms.logger.info(`Admin URL ${cms.getAdminURL()} `)
      }
    }
  })

  const cartRouter = express.Router()
  cartRouter.use(payload.authenticate)

  cartRouter.get('/', async (req, res) => {
    const request = req as PayloadRequest
    if (!request.user) {
      console.log('NO USER')
      res.redirect('/sign-in?origin=cart')
    }
    const parseUrl = parse(req.url, true)
    await nextApp.render(req, res, '/cart', parseUrl?.query)
  })

  app.use('/cart', cartRouter)

  if (process.env.NEXT_BUILD) {
    app.listen(PORT, async () => {
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
