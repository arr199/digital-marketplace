/* eslint-disable @typescript-eslint/strict-boolean-expressions */
'use client'
import { useRouter } from 'next/navigation'
import { type RefObject, useEffect } from 'react'
import { toast } from 'sonner'

type Event = MouseEvent | TouchEvent

export function useOnClickOutside <T extends HTMLElement = HTMLElement> (
  ref: RefObject<T>,
  handler: (event: Event) => void
): void {
  useEffect(() => {
    function listener (event: Event): void {
      const el = ref?.current
      if (!el || el.contains((event?.target as Node) || null)) {
        return
      }

      handler(event) // Call the handler only if the click is outside of the element passed.
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler]) // Reload only if ref or handler changes
}

export function useAuth (): { signOut: () => void } {
  const router = useRouter()
  const signOut = async (): Promise<void> => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) throw new Error()
      toast.success('Signed out successfully')
      router.push('/sign-in')
      router.refresh()
    } catch (err) {
      toast.error("Couldn't sign out , please try again")
    }
  }
  return { signOut }
}
