import React from 'react'
import { Inter } from 'next/font/google'
import '../global.css'
import { cn } from '@/lib/utils'
import Navbar from '@/components/navbar'
import Providers from '@/components/providers'
import { Toaster } from 'sonner'
import Footer from '@/components/footer'

const inter = Inter({ subsets: ['latin'] })

export default function FrontendLayout ({
  children
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <html lang="en" className='h-full'>
      <Providers>
        <body className={cn('relative h-full font-sans antialiased flex flex-col', inter.className)}>
          <Navbar></Navbar>
          <main className='flex-grow flex-1'>
            {children}
          </main>
          <Toaster richColors/>
          <Footer></Footer>
        </body>
      </Providers>
    </html>
  )
}
