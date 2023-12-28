import MaxWidthWrapper from '@/components/maxWidthWrapper'
import { getServerSideUser } from '@/lib/payload.utils'
import { type ProductFile, type Product } from '@/server/payload-types'
import Image from 'next/image'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import payload from 'payload'
import API from '@/lib/API'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import PaymentStatus from '@/components/paymentStatus'

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>
}

export default async function Thankyou ({ searchParams }: PageProps): Promise<JSX.Element> {
  const nextCookies = cookies()
  const { user } = await getServerSideUser(nextCookies)
  const { docs: orders } = await payload.find({
    depth: 2,
    collection: 'orders',
    where: { id: { equals: searchParams.orderId } }
  })

  const [order] = orders

  if (!order) return notFound()
  const orderUserId = typeof order.user === 'string' ? order.user : order.user.id

  if (orderUserId !== user?.id) {
    return redirect(`/sign-in?origin=thank-you?&orderId=${order.id}`)
  }
  const totalPrice = (order.products as Product[]).reduce((a, { price }) => a + price, 0)

  return (
    <MaxWidthWrapper className='lg:mt-10 max-w-3xl mt-5 px-4 border-l border-r border-dashed rounded-lg'>
      <div className='relative'>
        <div className=''>
          <p className='text-blue-600 text-sm font-semibold' >Order successful</p>
          <h1 className=' text-3xl sm:text-4xl font-bold mt-2'>Thank you for ordering!</h1>
          <p className='text-base text-muted-foreground max-w-xl mt-2'>You can download your files below. We&apos;ve sent you a receipt to
            <span className='font-semibold'> {user.email}.</span>
          </p>
        </div>
        <div className='flex flex-col text-sm mt-6'>
          <span className='text-muted-foreground font-medium mt-4'>Order number :</span>
          <span className='font-bold mt-1'>{order.id}</span>
        </div>
        <img className='bottom-0 sm:top-0 right-0 sm:h-40 sm:w-40 w-20 h-20 absolute' src="/hippo-email-sent.png" alt="" />
      </div>

      <ul className='border-t mt-4 sm:mt-10 py-4 '>
        {(order.products as Product[]).map((product) => {
          const { image } = product.images?.[0] as any
          const { url } = product.product_files as ProductFile
          const label = API.PRODUCT_CATEGORIES.find(({ value }) => product.category === value)?.label

          return (
            <li key={product.id} className='flex  gap-4'>
              {/* PRODUCT IMAGE */}
              <div className='relative w-40 h-40 flex object-cover aspect-square shadow-md'>
                <Image
                  alt={`${product.name} image`}
                  fill
                  src={image.url}
                >
                </Image>
              </div>
              {/* DESCRIPTION */}
              <div className='flex flex-col whitespace-nowrap mt-2'>
                <span className='text-sm font-semibold' >{product.name}</span>
                <span className='text-muted-foreground text-sm my-1 font-semibold'>Category: {label}</span>
                <div className='flex flex-col justify-end h-full '>
                 {/* DOWNLOAD LINK */}
                  {order.isPaid
                    ? <a
                      className='text-blue-500 mb-4 font-semibold text-sm hover:underline underline-offset-2 '
                      href={url as any}
                      download={product.name}>
                      Download Asset
                    </a>
                    : null}
                </div>
              </div>
              {/* PRICE */}
              <div className='w-full flex justify-end'>
                <p className='font-semibold'>{formatPrice(product.price)}</p>
              </div>
            </li>
          )
        })}
      </ul>
     {/* ORDER SUMMARY */}
      <div className='h-40 flex flex-col border-t  py-4 gap-4 text-muted-foreground text-sm font-medium'>
        <div className='flex justify-between '>
          <p className=''>Subtotal</p>
          <p className='font-semibold text-gray-900'>{formatPrice(totalPrice)}</p>
        </div>
        <div className='flex justify-between'>
          <p>Transaction fee</p>
          <p className='font-semibold text-gray-900'>{formatPrice(API.TRANSACTION_FEE)}</p>
        </div>
        <div className='flex justify-between text-gray-900  font-semibold border-t  pt-3 text-[1.2rem]'>
            <p>Total</p>
            <p className=' '>{formatPrice(totalPrice + API.TRANSACTION_FEE)}</p>
        </div>
        <PaymentStatus isPaid={order.isPaid} orderEmail={user.email} orderId={order.id} />
        {/* CONTINUE SHOPPING */}
        <div className='flex justify-center mt-10'>
          <Link href="/products" className={buttonVariants({ variant: 'link' })} >Continue Shopping  &rarr;</Link>
        </div>
      </div>
    </MaxWidthWrapper>
  )
}
