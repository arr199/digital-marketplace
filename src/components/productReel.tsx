'use client'

import { type TQueryValidatorSchema } from '../lib/zod-schemas'
import { type Product } from '../server/payload-types'
import { trpc } from '../trpc/client'
import Link from 'next/link'
import ProductListing from './productListing'

interface ProductReelProps {
  title: string
  subtitle?: string
  href?: string
  query: TQueryValidatorSchema

}
const FALLBACK_LIMIT = 4

export default function ProductReel ({ title, subtitle, href, query }: ProductReelProps): JSX.Element {
  const { data, isLoading } = trpc.getInfiniteProducts.useInfiniteQuery({
    limit: query.limit ?? FALLBACK_LIMIT,
    query
  }, { getNextPageParam: (lastPage) => lastPage.nextPage })

  const products = data?.pages.flatMap((page) => page.items)

  let map: Array<Product | null> = []
  if (products?.length) {
    map = products
  } else if (isLoading) {
    map = new Array(query.limit ?? FALLBACK_LIMIT).fill(null)
  }

  return (
   <section className='py-12'>
    <div className=" md:flex md:items-center md:justify-between mb-4">
        <div className="max-w-2xl px-4 lg:max-w-4xl lg:px-0">
            {title ? <h1 className="text-2xl font-bold sm:text-3lg">{title}</h1> : null }
            {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null }
        </div>
        { href
          ? <Link
                className='hidden text-sm font-medium text-blue-500 hover:text-blue-400 md:block'
                href={href}>Shop the collection &rarr; {' '}</Link>
          : null}
    </div>
    <div className='relative'>
        <div className='mt-6 flex items-center w-full'>
            <div className='w-full grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-10 lg:gap-x-8'>
              {map.map((product, index) =>
              <ProductListing product={product} index={index} key={index}>
              </ProductListing>
              ) }
            </div>
        </div>
    </div>
   </section>
  )
}
