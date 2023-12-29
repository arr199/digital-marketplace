'use client'
import { Icons } from '@/components/icons'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ArrowRight, Loader } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type AuthCredentials, AuthCredentialsSchema } from '@/lib/zod-schemas'
import { trpc } from '@/trpc/client'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Page (): JSX.Element {
  const { register, handleSubmit, formState: { errors } } = useForm<AuthCredentials>({ resolver: zodResolver(AuthCredentialsSchema) })
  const router = useRouter()
  const searchParams = useSearchParams()
  const isSeller = searchParams.get('as') === 'seller'
  const origin = searchParams.get('origin')
  console.log(origin)
  const { mutate: signIn, isLoading } = trpc.auth.loginUser.useMutation({
    onSuccess: async () => {
      toast.success('Signed in successfully')

      if (origin) {
        router.push(`/${origin}`)
        return
      }

      if (isSeller) {
        router.push('/sell')
        return
      }

      router.push('/')
      router.refresh()
    },
    onError: ({ data }) => {
      toast.error(data?.code)
    }

  })

  function onSubmit ({ email, password }: AuthCredentials): void {
    signIn({ email, password })
  }

  function handleContinueAsBuyer (): void {
    router.replace('/sign-in')
  }
  function handleContinueAsSeller (): void {
    router.push('?as=seller', undefined)
  }

  return (
    <>
      <div className="container relative flex flex-col justify-center items-center pt-20">
        <Icons.logo className="h-20 w-20"></Icons.logo>
        <h1 className='text-2xl  font-bold'>
          { isSeller ? 'Sign in as a Seller' : 'Sign in' }
        </h1>
        <Link
          className={buttonVariants({ variant: 'link', className: 'gap-2' })}
          href='/sign-up'>
          Don&apos;t have an account? Create one !
          <ArrowRight></ArrowRight>
        </Link>
        <form onSubmit={handleSubmit(onSubmit)}
        className='flex flex-col gap-6 w-full max-w-md'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor="email">Email</Label>
            <Input
              {...register('email')}
              className={cn({
                'focus-visible:ring-red-500': errors.email
              })}
              id='email'
              placeholder='example@gmail.com'
            />
            <p className='text-red-500 text-sm'>{errors.email?.message}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor="password">Password</Label>
            <Input {...register('password')} type='password'
              className={cn({
                'focus-visible:ring-red-500': errors.password
              })}
              id='password'
              placeholder='*******'
            />
            <p className='text-red-500 text-sm'>{errors.password?.message}</p>
          </div>
          <Button
          disabled={isLoading}
          className='relative active:scale-95 flex items-center gap-2 mt-2 '>
            {isLoading ? 'Verifying ...' : 'Sign in' }
          {isLoading &&
          <Loader className='animate-spin sticky text-slate-300' >
          </Loader> }
          </Button>
          <div className='flex  items-center'>
            <span className='w-full border-t'></span>
              <span className='text-muted-foreground'>
              OR
              </span>
            <span className='w-full border-t'></span>
          </div>
          { isSeller
            ? <Button
                variant="secondary"
                type='button'
                onClick={handleContinueAsBuyer}
                disabled={isLoading}>
                  Continue as customer
             </Button>
            : <Button
                variant="secondary"
                type='button'
                onClick={handleContinueAsSeller}
                disabled={isLoading}>
                  Continue as seller
             </Button> }

        </form>
      </div>
    </>
  )
}
