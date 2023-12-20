'use client'
import { trpc } from '@/trpc/client'
import { Loader2, XCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { buttonVariants } from './ui/button'

interface VerifyEmailProps {
  token: string
}

export default function VerifyEmail ({ token }: VerifyEmailProps): JSX.Element {
  const { data, isLoading, isError } = trpc.auth.verifyEmail.useQuery({ token })

  console.log(token)
  if (isError) {
    return (
      <div className='flex flex-col gap-2 items-center'>
        <XCircle className='h-8 w-8 text-red-500'></XCircle>
        <h3 className='font-semibold text-xl'>There was a problem</h3>
        <p className='text-muted-foreground text-sm'>The token is not valid or might be expired.
        Please try again.
        </p>
      </div>
    )
  }
  if (data?.success) {
    return (
        <div className='flex h-full flex-col items-center justify-center'>
            <div className='relative mb-4 h-60 w-60 text-muted-foreground'>
              <Image src="/hippo-email-sent.png"
              fill
              alt='email was sent'/>

            </div>
            <h3 className='font-semibold text-2xl'>You&apos;re all set!</h3>
            <p className='text-muted-foreground text-center mt-1'>Thank you for verifying your email</p>
            <Link
            className={buttonVariants({ className: 'mt-4' })}
             href="/sign-in">
              Sign in
             </Link>
        </div>
    )
  }
  if (isLoading) {
    return (
          <div className='flex flex-col gap-2 items-center justify-center
           absolute w-[300px] m-auto inset-0  '>
            <Loader2 className='animate-spin h-12 w-12 text-blue-500'></Loader2>
            <h3 className='font-semibold text-xl'>Verifying ...</h3>
            <p className='text-muted-foreground text-sm'>
              This wont take long
            </p>
          </div>
    )
  }
  return <></>
}
