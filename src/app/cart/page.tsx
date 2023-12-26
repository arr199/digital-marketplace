'use client'

import MaxWidthWrapper from '@/components/maxWidthWrapper'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'
import Image from 'next/image'
import API from '@/lib/API'
import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Check, Loader2, X } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { trpc } from '@/trpc/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const BREADCRUMBS = [
  { id: 1, name: 'Home', href: '/' },
  { id: 2, name: 'Cart', href: '/cart' }

]

export default function Page (): JSX.Element {
  const { items, removeItem } = useCart()
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  const { mutate, isLoading } = trpc.payment.createSession.useMutation({
    onSuccess: ({ url }) => {
      if (url) router.push(url)
    },
    onError: () => {
      toast.error('You must login first!', { position: 'top-right' })
      router.push('/sign-in?origin=cart')
    }
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return <></>
  const productIds = items.map((prod) => prod.product.id)
  const cartTotal = items.reduce((acc, curr) => acc + curr.product.price, 0)
  const fee = 1

  return (
  <MaxWidthWrapper >
    <div className='mt-10'>
        <h1 className='text-3xl font-bold'>Shoping Cart</h1>
         <div className='mt-4 flex items-center text-sm font-medium text-muted-foreground'>
            {BREADCRUMBS.map(({ name, href }, index) => (
                <div key={name} className='flex items-center' >
                    <Link href={href}>{name}</Link>
                    {BREADCRUMBS.length - 1 === index
                      ? null
                      : <div className='h-4 w-px bg-gray-400 mx-3 rotate-[35grad]'></div> }
                </div>
            ))}
         </div>

       {/* EMPTY CART */}
        { items.length === 0
          ? <div className='p-8 mt-4 w-full flex justify-center flex-col items-center border-dashed  rounded-xl border-zinc-200 border-2' >
                <div className='relative h-40 w-40'>
                    <Image className=''
                    alt='empty shopping cart hippo'
                    fill
                    src='/hippo-empty-cart.png'>
                    </Image>
                </div>
                <h3 className='font-semibold text-lg'>Your cart is empty</h3>
                <p className='text-sm text-muted-foreground'>Whoops! Nothing yet. </p>
            </div>
        // FULL CART
          : <ul className=' mt-4  grid lg:grid-cols-2 grid-cols-1 gap-x-10 gap-y-4 pb-20'>
            {items?.map(({ product }) => {
              const label = API.PRODUCT_CATEGORIES.find(({ value }) => value === product.category)?.label
              const imageUrl = product?.images?.[0]?.image.url
              return (
                <li className='flex border-dashed col-start-1  rounded-xl border-zinc-200 border-2 p-4 relative '
                key={product.id}>
                   {/* IMAGE */}
                    <div className='relative h-40 w-40 flex items-center shadow-sm'>
                        <Image alt={`${product.name} Image`} src={imageUrl ?? ''} fill></Image>
                    </div>
                    {/* PRODUCT INFO */}
                    <div className='flex flex-col ml-4 mt-2 gap-2'>
                        <h3 className='capitalize font-semibold'><Link href={`/product/${product.id}`}>{product.name}</Link></h3>
                        <p className='text-sm text-muted-foreground tracking-wide'>Category: {label}</p>
                        <span className=' font-semibold'>{formatPrice(product.price)}</span>
                        <p className='text-sm flex items-center mt-auto whitespace-nowrap'><Check className='text-green-500'></Check> Instant Delivery</p>
                    </div>
                    {/* HIPPO IMAGE */}
                    <Image
                        className='absolute right-5 w-auto h-auto hidden lg:block self-center justify-self-center ml-40'
                        alt='hippo Image'
                        width={80}
                        height={80}
                        src={'/hippo-empty-cart.png'}/>
                    {/* REMOVE PRODUCT BUTTON */}
                    <Button
                    onClick={ () => { removeItem(product.id) }}
                    variant={'ghost'}
                    className="absolute top-2 right-2"
                    aria-label='remove products'>
                        <X aria-hidden="true"></X>
                    </Button>
                </li>
              )
            })}
             {/* CHECKOUT */}
             <section className=' bg-zinc-50 rounded-xl p-5 lg:col-start-2 lg:row-start-1  relative'>
             {/* PRICE */}
                <div className='flex flex-col gap-2'>
                    <h1 className='font-semibold '>Order summary</h1>
                    <div className='flex justify-between'>
                        <p className='text-sm text-muted-foreground'>Subtotal</p>
                        <p className='text-sm  font-semibold'>{formatPrice(cartTotal)}</p>
                    </div>
                    <Separator className='my-2'></Separator>
                    <div className='flex justify-between items-center '>
                        <p className='text-sm text-muted-foreground'>Transaction Fee</p>
                        <p className='text-sm  font-semibold'>{formatPrice(fee)}</p>
                    </div>
                    <Separator className='my-2'></Separator>
                    <div className='flex justify-between'>
                        <p className='text-sm font-bold'>Order Total</p>
                        <p className='font-bold'>{formatPrice(cartTotal + fee)}</p>
                    </div>
                </div>
                {/* CHECKOUT BUTTON */}
                <Button
                disabled={items.length <= 0 || isLoading}
                onClick={() => { mutate({ productIds }) }}
                className=' left-0 absolute w-full mt-8 selection:items-center'>Checkout
                  {isLoading ? <Loader2 className='animate-spin ml-4'></Loader2> : null}
                </Button>
            </section>
          </ul> }
          </div>
  </MaxWidthWrapper>
  )
}
