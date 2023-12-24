'use client'
import { ShoppingCart } from 'lucide-react'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { Separator } from './ui/separator'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { buttonVariants } from './ui/button'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'
import CartItem from './cartItem'
import { ScrollArea } from './ui/scroll-area'
import { useState, useEffect } from 'react'

export default function Cart (): JSX.Element {
  const { items } = useCart()
  const itemsCount = items.length
  const totalPrice = items.reduce((acc, curr) => acc + curr.product.price, 0)
  const fee = 1
  const [isMounted, setIsMounted] = useState<boolean>(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
        <Sheet>
          <SheetTrigger className='flex p-2 group'>
            <ShoppingCart
            className='h-6 w-6 text-gray-400 group-hover:text-gray-500 '
            aria-hidden="true"/>
            <span className='ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800 '>
              {isMounted ? itemsCount : 0}
            </span>
          </SheetTrigger>
          <SheetContent className='flex flex-col sm:max-w-md '>
            <SheetHeader>
               <SheetTitle>Cart ({itemsCount})</SheetTitle>
            </SheetHeader>
            { itemsCount > 0
              ? <>
                <div className='flex w-full flex-col '>
                <ScrollArea>
                  {items.map(({ product }) => (
                    <CartItem
                      product={product}
                      key={product.id}
                    />
                  ))}
                </ScrollArea>

                </div>
                <div className='space-y-4 pr-6'>
                <Separator />
                <div className='space-y-1.5 pr-6'>
                   <div className='flex'>
                    <span className='flex-grow'>Shipping</span>
                    <span >Free</span>
                   </div>
                   <div className='flex'>
                    <span className='flex-grow'>Transaction Fee</span>
                    <span >{formatPrice(fee)} </span>
                   </div>
                   <div className='flex'>
                    <span className='flex-grow'>Total</span>
                    <span >{formatPrice(totalPrice + fee)} </span>
                   </div>
                </div>
              </div>
              <SheetFooter>
                <SheetTrigger asChild>
                  <Link
                  className={buttonVariants({ className: 'w-full' })}
                  href="/cart">Continue to Checkout &rarr;
                  </Link>
                </SheetTrigger>
              </SheetFooter>
              </>
              : <div className='flex flex-col h-full items-center justify-center space-y-1'>
                    <Image
                    width={300}
                    height={300}
                    src="/hippo-empty-cart.png"
                    alt="empty shopping cart hippo">
                    </Image>
                <div className='text-black text-xl font-semibold'>Your cart is empty</div>
                <SheetTrigger asChild>
                  <Link
                  href="/products"
                  className={buttonVariants({ variant: 'link', size: 'sm', className: 'text-sm text-muted-foreground' })}
                  >
                  Add items to your cart to checkout
                  </Link>
                </SheetTrigger>
               </div> }
          </SheetContent>
        </Sheet>
  )
}
