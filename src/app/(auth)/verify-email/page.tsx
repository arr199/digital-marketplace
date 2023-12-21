import VerifyEmail from '@/components/verifyEmail'
import Image from 'next/image'

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>
}

export default function Page ({ searchParams }: PageProps): JSX.Element {
  const token = searchParams.token
  const toEmail = searchParams.to
  console.log(token)
  return (
   <div className='container flex flex-col pt-20 items-center justify-center lg:px-0'>
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">

                {token && typeof token === 'string'
                  ? <div className="grid gap-6">
                    <VerifyEmail token={token}></VerifyEmail>

                   </div>
                  : <div className="flex h-full flex-col items-center justify-center space-y-1 mt-20 ">
                        <div className="relative mb-4 h-60 w-60 text-muted-foreground">
                            <Image
                                fill
                                src={'/hippo-email-sent.png'}
                                alt='hippo-sent-email'
                                >
                            </Image>
                        </div>
                        <h3 className='font-semibold text-2xl'>Check your email</h3>
                        {toEmail
                          ? <p className='text-muted-foreground text-center'>
                                We&apos;ve sent a verification link to
                                <span className='font-semibold'>
                                    {toEmail}
                                </span>
                           </p>
                          : <p>We&apos;ve sent a verification link to your email</p>}
                   </div> }
        </div>
   </div>
  )
}
