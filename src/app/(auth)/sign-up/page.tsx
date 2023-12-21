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
import { useRouter } from 'next/navigation'

export default function Page (): JSX.Element {
  const { register, handleSubmit, formState: { errors } } = useForm<AuthCredentials>({ resolver: zodResolver(AuthCredentialsSchema) })
  const router = useRouter()

  const { mutate, isLoading } = trpc.auth.createPayloadUser.useMutation({
    onError: (err) => {
      if (err.data?.code === 'CONFLICT') {
        toast.error(err.message + '.')
        return
      }
      toast.error('Somehting went wrong. Please try again ')
    },
    onSuccess: ({ sentToEmail }) => {
      toast.success(`Verification Email sent to ${sentToEmail}`)
      router.push('/verify-email')
    }

  })

  function onSubmit ({ email, password }: AuthCredentials): void {
    mutate({ email, password })
  }

  return (
    <>
      <div className="container relative flex flex-col justify-center items-center pt-20">
        <Icons.logo className="h-20 w-20"></Icons.logo>
        <h1 className='text-2xl  font-bold'>
          Create an Account
        </h1>
        <Link
          className={buttonVariants({ variant: 'link', className: 'gap-2' })}
          href='/sign-in'>
          Already have an account? Sign-in
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
          className='relative active:scale-95 flex items-center gap-2 mt-2 '>{isLoading ? 'Verifying ...' : 'Sign up' }
          {isLoading && <Loader className='animate-spin sticky text-slate-300' ></Loader> }
          </Button>
        </form>
      </div>
    </>
  )
}
