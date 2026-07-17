import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

export default function MaxWidthWrapper ({ children, className }:
{ children: ReactNode, className?: string }): React.ReactElement {
  return (
        <div
        className={cn(
          'mx-auto w-full max-w-screen-xl px-2.5 md:px-20 ', className)} >
            {children}
        </div>
  )
}
