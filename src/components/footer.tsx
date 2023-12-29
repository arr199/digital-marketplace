'use client'
import { usePathname } from 'next/navigation'
import { Icons } from './icons'
import MaxWidthWrapper from './maxWidthWrapper'
import Link from 'next/link'

export default function Footer (): JSX.Element {
  const pathToMinimize = ['/verify-email', '/sign-up', '/sign-in']
  const currentPath = usePathname()
  return (
   <footer className='flex-grow-0 bg-white'>
        <MaxWidthWrapper>
                <div className="border-t border-gray-200">
                    {pathToMinimize.includes(currentPath)
                      ? null
                      : <div className='flex justify-center pb-6 pt-8'>
                            <Icons.logo className="h-12 w-auto"></Icons.logo>
                        </div>
                    }
                </div>
                {pathToMinimize.includes(currentPath)
                  ? null
                  : <div >
                        <div className='py-4 bg-slate-50 rounded'>
                            <h3 className='text-center font-semibold mb-4 '>Become a Seller</h3>
                            <p className='text-sm text-center text-muted-foreground '>If you&apos;d like to sell digital products, you can <br></br>do so in minutes.
                                <Link className='font-semibold hover:underline text-black ' href="/sign-in?as=seller">
                                    {' '}Get started &rarr;
                                </Link>
                            </p>
                        </div>
                        <div className='text-center py-8'>
                            <p className='text-sm text-muted-foreground'>&copy; {new Date().getFullYear()} All Rights Reserved</p>
                        </div>
                        <div className='flex text-sm text-muted-foreground gap-6 justify-center pb-6'>
                           <Link href="#">Cookie Policy</Link>
                           <Link href="#">Terms</Link>
                           <Link href="#">Privacy Policy</Link>
                        </div>
                    </div>
                    }
        </MaxWidthWrapper>
   </footer>
  )
}
