import AddToCartButton from '@/components/addToCarButton'
import ImageSlider from '@/components/imageSlider'
import MaxWidthWrapper from '@/components/maxWidthWrapper'
import ProductReel from '@/components/productReel'
import API from '@/lib/API'
import { formatPrice } from '@/lib/utils'
import { getPayloadClient } from '@/server/get-payload'
import { Check, Shield } from 'lucide-react'

// import { getPayloadClient } from '@/server/get-payload'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    productId: string
  }
}
const BREADCRUMBS = [
  { id: 1, name: 'Home', href: '/' },
  { id: 2, name: 'Products', href: '/products' }

]

export default async function Page ({ params: { productId } }: PageProps): Promise<JSX.Element> {
  const payload = await getPayloadClient({})
  const { docs: products } = await payload.find({
    collection: 'products',
    limit: 1,
    where: { id: { equals: productId }, approvedForSale: { equals: 'approved' } }
  })
  const [product] = products
  if (!products[0]) return notFound()

  const label = API.PRODUCT_CATEGORIES.find((e) => e.value === product.category)?.label
  const urls = product?.images?.map(({ image }) => typeof image === 'string' ? image : image.url)
    .filter(Boolean) as string[]

  return (
    <MaxWidthWrapper>
      <div className='bg-white'>
        <div className='mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8'>
          <div className='lg:max-w-lg lg:self-end'>
            <ol className='flex  text-sm items-center'>
              {/* BREADCRUMBS */}
              {BREADCRUMBS.map((breadcrumb, index) => (
                <li key={breadcrumb.href} className='flex items-center'>
                  <Link
                    className='hover:text-black text-gray-500 font-medium  '
                    href={breadcrumb.href}>{breadcrumb.name}</Link>
                  {index !== BREADCRUMBS.length - 1
                    ? <div className='bg-gray-300 h-5 w-px mx-4 rotate-[35grad]'></div>
                    : null}
                </li>
              ))}
            </ol>
            <div className='mt-4'>
              {/* NAME */}
              <h1 className='text-3xl tracking-tight font-bold sm:text-4xl capitalize'>
                {product.name}
              </h1>
            </div>
            <section className='mt-4'>
              <div className='flex items-center'>
                {/* PRICE */}
                <p className=''>{formatPrice(product.price)}</p>
                <div className='ml-4 border-l text-muted-foreground border-gray-300 pl-4'>
                  {label}
                </div>
              </div>
              {/* DESCRIPTION */}
              <div className='mt-4 space-y-6'>
                <p className='text-base text-muted-foreground '>
                  {product.description}
                </p>
              </div>
              <div className='mt-6 flex  items-center'>
                <Check
                  className='h-5 w-5 text-green-500 '
                  aria-hidden="true" >
                </Check>
                <p className='ml-2 text-sm text-muted-foreground'>Eligible for instant delivery</p>

              </div>
            </section>
          </div>
          {/* IMAGES */}
          <div className='mt-4 lg:col-start-2 lg:row-span-2  lg:self-center '>
            <ImageSlider urls={urls}></ImageSlider>
          </div>
          <div className='py-4 lg:col-start-1 lg:mt-20'>
            <AddToCartButton product={product}></AddToCartButton>
            <div className='flex justify-center mt-10 '>
              <p className='flex text-center  text-muted-foreground text-sm gap-2'><Shield></Shield> 30 Day Return Guarantee</p>
            </div>
          </div>
        </div>
      </div>
      {/* SIMILAR PRODUCTS */}
      <ProductReel
        href='/products'
        query={{ category: product.category, limit: 4 }}
        title={`Similar ${label}`}
        subtitle={`Browser similar ${label} just like '${product.name}'`}
      >

      </ProductReel>
    </MaxWidthWrapper>
  )
}
