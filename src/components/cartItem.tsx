import { useCart } from '@/hooks/useCart'
import API from '@/lib/API'
import { formatPrice } from '@/lib/utils'
import { type Product } from '@/server/payload-types'
import { ImageIcon, X } from 'lucide-react'
import Image from 'next/image'

export default function CardItem ({ product }: { product: Product }): JSX.Element {
  const { removeItem } = useCart()
  const image = product?.images?.[0].image.url

  const label = API.PRODUCT_CATEGORIES.find((e) => e.value === product.category)?.label

  return (
   <div className='w-full h-full space-y-1 flex gap-4 mt-4  '>
          <div className='relative w-20 h-20  aspect-square   '>
          { image
            ? (<Image
                className='object-cover'
                alt='product image'
                fill
                src={image}>

                </Image>)
            : <div className='flex h-full items-center justify-center bg-secondary'>
                <ImageIcon
                aria-hidden='true'
                className='h-4 w-4 text-muted-foreground'
            />
             </div>
            }
          </div>
          <div className='w-full flex'>
              <div className='flex flex-col self-start '>
                <span className='text-sm line-clamp-1 font-semibold capitalize'>{product.name}</span>
                <span className='line-clamp-1 text-xs'>{label}</span>
                <div className='mt-4 text-xs text-muted-foreground flex'>
                 {/* REMOVE BUTTON */}
                  <button
                  onClick={ () => { removeItem(product.id) }}
                  className='flex items-center hover:text-red-500   duration-100'>
                    <X
                    className='w-[14px] h-[14px]  '>
                  </X> Remove
                  </button>
              </div>
              </div>
              {/* PRICE */}
               <p className='ml-auto mr-10'>{formatPrice(product.price)}</p>
          </div>

   </div>
  )
}
