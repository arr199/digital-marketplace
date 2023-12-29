import MaxWidthWrapper from '@/components/maxWidthWrapper'
import ProductReel from '@/components/productReel'
import API from '@/lib/API'

export default function Page ({ searchParams }: { searchParams: Record<string, string | undefined | string[]> }): JSX.Element {
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : undefined
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined
  const label = API.PRODUCT_CATEGORIES.find(({ value }) => value === category)?.label

  return (
    <MaxWidthWrapper>
        <ProductReel query={{
          limit: 20,
          sort: sort === 'asc' || sort === 'desc' ? sort : 'asc',
          category
        }} title={label ?? 'Products'} ></ProductReel>
    </MaxWidthWrapper>
  )
}
