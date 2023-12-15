import { ShoppingCart } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { Separator } from './ui/separator'
import { formatPrice } from '@/lib/utils'

export default function Cart (): JSX.Element {
  const itemsCount = 1
  return (
        <Sheet>
          <SheetTrigger className='flex p-2 group'>
            <ShoppingCart
            className='h-6 w-6 text-gray-400 group-hover:text-gray-500 '
            aria-hidden="true"/>
            <span className='ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800 '>
              0
            </span>
          </SheetTrigger>
          <SheetContent className='flex flex-col sm:max-w-md '>
            <SheetHeader>
               <SheetTitle>Cart (0)</SheetTitle>
            </SheetHeader>
            { itemsCount > 0
              ? <>
                <div className='flex w-full flex-col pr-6'>
                  {/* TODO CART LOGIC */}
                  Cart items
                </div>
              </>
              : null }
              <div className='space-y-4 pr-6'>
                <Separator />
                <div className='space-y-1.5 pr-6'>
                   <div className='flex'>
                    <span className='flex-grow'>Shipping</span>
                    <span >Free</span>
                   </div>
                   <div className='flex'>
                    <span className='flex-grow'>Transaction Fee</span>
                    <span >{formatPrice(12.12)} </span>
                   </div>
                </div>
              </div>
          </SheetContent>
        </Sheet>
  )
}
