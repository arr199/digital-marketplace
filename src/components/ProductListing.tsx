'use client'
import { type Product } from '../server/payload-types'
import { useEffect, useState } from 'react'
import { Skeleton } from './ui/skeleton'
import Link from 'next/link'
import { cn, formatPrice } from '../lib/utils'
import API from '../lib/API'
import ImageSlider from './imageSlider'

interface ProductListingProps {
  product: Product | null
  index: number

}

export default function ProductListing ({ product, index }: ProductListingProps): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, index * 75)

    return () => { clearTimeout(timer) }
  }, [index])

  if (!product || !isVisible) {
    return <ProductPlaceholder />
  }

  const label = API.PRODUCT_CATEGORIES.find(({ value }) => value === product.category)?.label
  const urls = product?.images?.map(({ image }) => typeof image === 'string' ? image : image.url)
    .filter(Boolean) as string[]

  if (isVisible && product) {
    return (
        <Link className={cn(
          'invisible h-full w-full  cursor-pointer group/main ', {
            'visible animate-in fade-in-5': isVisible

          })}
        href={`/product/${product.id}`}>
            <div className='flex flex-col w-full'>
                <ImageSlider urls={urls} />
                <h3 className='mt-4 font-medium text-sm text-gray-700'>{product.name}</h3>
                <p className='mt-1 text-sm text-gray-500'>{label}</p>
                <p className='mt-1 font-medium text-sm'>{formatPrice(product.price)}</p>
            </div>
        </Link>
    )
  }
  return <></>
}

export function ProductPlaceholder (): JSX.Element {
  return (
   <div className='flex flex-col w-full'>
    <div className='relative aspect-square w-full bg-zinc-100 overflow-hidden rounded-xl'>
        <Skeleton className='h-full w-full'></Skeleton>
    </div>
        <Skeleton className='mt-4 w-2/3 h-4 rounded-lg'></Skeleton>
        <Skeleton className='mt-4 w-16 h-4 rounded-lg'></Skeleton>
        <Skeleton className='mt-4 w-12 h-4 rounded-lg'></Skeleton>
   </div>
  )
}
