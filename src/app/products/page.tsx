import MaxWidthWrapper from '@/components/maxWidthWrapper'
import ProductReel from '@/components/productReel'
import API from '@/lib/API'

export default async function Page ({ searchParams }: { searchParams: Promise<Record<string, string | undefined | string[]>> }): Promise<React.ReactElement> {
  const resolvedSearchParams = await searchParams
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : undefined
  const category = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined
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
