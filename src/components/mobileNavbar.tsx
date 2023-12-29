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
import { MenuIcon } from 'lucide-react'

export default function MobileNavbar ({ user }: { user: User | null }): JSX.Element {
  const { signOut } = useAuth()
  return (
      <DropdownMenu>
          <DropdownMenuTrigger asChild className='overflow-visible'>
                  <Button variant="ghost" size="sm"><MenuIcon className='h-8 w-8'></MenuIcon></Button>
          </DropdownMenuTrigger>
         {/* USER EXIST */}
         {user
           ? <DropdownMenuContent className=''>
              <div className='flex items-center justify-start gap-2 p-2'>
                  <p className='text-sm font-medium '>{user?.email}</p>
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
         //   USER DOESNT EXIST
           : <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                  <Link className='cursor-pointer font-medium' href="/sign-in">
                      Sign in
                  </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                  <Link className='cursor-pointer font-medium' href="/sign-up">
                     Create account
                  </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>}

    </DropdownMenu>

  )
}
