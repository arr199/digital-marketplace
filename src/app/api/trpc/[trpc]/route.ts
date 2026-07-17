import { appRouter } from '@/trpc'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

function handler (req: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    router: appRouter,
    req,
    createContext: () => ({
      headers: req.headers
    })
  })
}

export { handler as GET, handler as POST }
