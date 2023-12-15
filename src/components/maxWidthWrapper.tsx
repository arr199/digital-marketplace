import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

export default function MaxWidthWrapper ({ children, className }:
{ children: ReactNode, className?: string }): JSX.Element {
  return (
        <div
        className={cn(
          'mx-auto w-full max-w-screen-xl px-2.5 md:px-20 py-2', className)} >
            {children}
        </div>
  )
}
