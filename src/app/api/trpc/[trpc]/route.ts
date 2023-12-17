import { appRouter } from '@/trpc'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

function handler (req: Request): void {
  fetchRequestHandler({
    endpoint: '/api/trpc',
    router: appRouter,
    req,
    createContext: () => ({})
  }).catch(err => { console.log(err) })
}

export { handler as GET, handler as POST }
