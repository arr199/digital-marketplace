'use client'
import { Icons } from '@/components/icons'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type AuthCredentials, AuthCredentialsSchema } from '@/lib/zod-schemas'

export default function Page (): JSX.Element {
  const { register, handleSubmit, formState } = useForm<AuthCredentials>({ resolver: zodResolver(AuthCredentialsSchema) })

  function onSubmit ({ email, password }: AuthCredentials) {

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
                'focus-visible:ring-red-500': formState.errors.email
              })}
              id='email'
              placeholder='example@gmail.com'
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor="password">Password</Label>
            <Input {...register('password')}
              className={cn({
                'focus-visible:ring-red-500': formState.errors.password
              })}
              id='password'
              placeholder='*******'
            />
          </div>
          <Button>Sign up</Button>
        </form>
      </div>
    </>
  )
}
