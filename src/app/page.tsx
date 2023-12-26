import MaxWidthWrapper from '@/components/maxWidthWrapper'
import ProductReel from '@/components/productReel'
import { Button, buttonVariants } from '@/components/ui/button'
import { ArrowDownToLine, CheckCircle, Leaf } from 'lucide-react'
import Link from 'next/link'

const perks = [
  {
    name: 'Instant Delivery',
    icon: ArrowDownToLine,
    description: 'Get your assets delivered to your email in seconds and download them right away.'
  },

  {
    name: 'Guaranteed Quality',
    icon: CheckCircle,
    description: 'Every asset in our platform in verify by our team to ensure our highest quality standards. '
  },
  {
    name: 'For the Planet',
    icon: Leaf,
    description: "We've pledged 1% of sales to the preservation and restoration of the natural environment."
  }
]

export default function Home (): JSX.Element {
  return (
   <>
    <MaxWidthWrapper>
      <div className='py-20 mx-auto text-center flex flex-col items-center max-w-3xl'>
        <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
          Your marketplace for  high-quality {' '}
          <span className='text-blue-500'>digital assets.</span>
        </h1>
        <p className='mt-6 text-lg max-w-prose text-muted-foreground'>
            Welcome to DigitalHippo. Every asset on our
            platform is verified by our team to ensure our
            highest quality standards.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 mt-6'>
        <Link href='/products' className={buttonVariants()} >Browse Trending</Link>
        <Button variant={'ghost'}> Our quality promise &rarr; </Button>
        </div>
      </div>
    <ProductReel query={{ sort: 'desc', limit: 4 }} title='Brand New' subtitle='' href='12'></ProductReel>
    </MaxWidthWrapper>
    <section className='border-t border-gray-200 bg-gray-50'>
      <MaxWidthWrapper className='py-20'>
       <div
          className='grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0 '>
            {perks?.map(perk =>
              <div
               className='text-center  md:flex md:flex-col  md:items-start md:text-left lg:block lg-text-center '
               key={perk.name}>
                 <div className=' h-16 w-16 mx-auto flex justify-center rounded-full items-center bg-blue-100'>
                  {<perk.icon className='w-1/3 h-1/3' />}
                 </div>
                 <div className='text-center mx-6 flex flex-col mt-4'>
                  <h3 className=' mt-3 text-base font-medium text-gray-900'>{perk.name}</h3>
                  <p className=' flex-wrap mt-3 text-sm text-muted-foreground'>{perk.description}</p>
                 </div>
              </div>
            )}
        </div>
      </MaxWidthWrapper>
    </section>
   </>
  )
}
