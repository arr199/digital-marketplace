import Link from 'next/link'
import { Icons } from './icons'
import MaxWidthWrapper from './maxWidthWrapper'
import { NavItems } from './navItems'
import { buttonVariants } from './ui/button'
import Cart from './cart'
import { getServerSideUser } from '@/lib/payload.utils'
import { cookies } from 'next/headers'
import UserAccountDropDown from './userAccountDropDown'
import MobileNavbar from './mobileNavbar'

export default async function Navbar (): Promise<JSX.Element> {
  const nextCookies = cookies()
  const { user } = await getServerSideUser(nextCookies)

  return (
    <div className="sticky z-50 top-0 h-16  bg-white">
      <header className='relative ' >
        <MaxWidthWrapper className='border-b border-gray-200 flex gap-4 py-2'>
          {/* TODO Movil Nav */}
          <div className='lg:hidden'>
           <MobileNavbar user={user}/>
          </div>
          <Link href="/" className='ml-4 flex lg:ml-0'>
            {<Icons.logo className="h-10 w-10" ></Icons.logo>}
          </Link>
          <div className='hidden z-50 lg:ml-8 lg:block lg:self-stretch'>
            <NavItems></NavItems>
          </div>
          <div className='ml-auto flex items-center '>
            <div className='hidden lg:flex lg:flex-1 items-center lg:justify-end lg:space-x-6 space-x-1'>
              {user
                ? null
                : <Link
                  className={buttonVariants({ variant: 'ghost' })}
                  href="/sign-in">
                  Sign in
                </Link>}

              {user
                ? null
                : <span
                  className='h-6 bg-gray-200 w-px'
                  aria-hidden="true" >
                  </span> }

              {user
                ? <UserAccountDropDown user={user}></UserAccountDropDown>
                : <Link
                  className={buttonVariants({ variant: 'ghost' })}
                  href="/sign-up">
                  Create account
                  </Link>}
              {user
                ? <span className='h-6 bg-gray-200 w-px'>
                 </span>
                : null}

                { user
                  ? null
                  : <div className='flex lg:ml-6'>
                      <span
                      className='h-6 bg-gray-200 w-px'
                      aria-hidden="true">

                      </span>
                   </div> }

            </div>
            <div className='ml-4 flow-root lg:ml-6'>
                <Cart></Cart>
            </div>
          </div>
        </MaxWidthWrapper>
      </header>
    </div>
  )
}
