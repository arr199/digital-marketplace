'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { trpc } from '@/trpc/client'
import { httpBatchLink } from '@trpc/client'

function getBaseUrl (): string {
  if (typeof window !== 'undefined') return ''
  if (process.env.NEXT_PUBLIC_SERVER_URL) return process.env.NEXT_PUBLIC_SERVER_URL
  return 'http://localhost:3000'
}

export default function Providers ({ children }: { children: ReactNode }): React.ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  const [trpcClient] = useState(() => trpc.createClient({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
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
