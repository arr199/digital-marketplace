'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from './ui/button'
import { type User } from '../server/payload-types'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function UserAccountDropDown ({ user }: { user: User }): JSX.Element {
  const { signOut } = useAuth()
  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild className='overflow-visible'>
                <Button variant="ghost" size="sm">My account</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <div className='flex items-center justify-start gap-2 p-2'>
                <p className='text-sm font-medium '>{user.email}</p>
            </div>
            <DropdownMenuSeparator></DropdownMenuSeparator>
            <DropdownMenuItem asChild>
                <Link className='cursor-pointer' href="/sell">
                    Seller Dashboard
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
            onClick={signOut}
            className='cursor-pointer'>Log out</DropdownMenuItem>
        </DropdownMenuContent>
  </DropdownMenu>

  )
}
