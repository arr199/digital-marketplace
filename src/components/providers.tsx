'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { trpc } from '@/trpc/client'
import { httpBatchLink } from '@trpc/client'

export default function Providers ({ children }: { children: ReactNode }): JSX.Element {
  const [queryClient] = useState(() => new QueryClient())

  const [trpcClient] = useState(() => trpc.createClient({
    links: [
      httpBatchLink({
        url: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/trpc`,
        async fetch (url, options) {
          return await fetch(url, { ...options, credentials: 'include' })
        }
      })
    ]
  }))

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
   </trpc.Provider>
  )
}
