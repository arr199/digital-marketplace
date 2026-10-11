import { expect, test } from '@playwright/test'
import { trpcQuery } from '../helpers'
import { PRODUCTS } from '../test-env'

test.describe('storefront catalogue (getInfiniteProducts)', () => {
  test('lists approved products only', async ({ request }) => {
    const { status, body } = await trpcQuery(request, 'getInfiniteProducts', { limit: 100, query: {} })
    expect(status).toBe(200)
    const names = body.result.data.items.map((p: any) => p.name)
    expect(names).toEqual(expect.arrayContaining([PRODUCTS.approvedA, PRODUCTS.approvedB]))
    expect(names).not.toContain(PRODUCTS.pending)
  })

  test('filters by category', async ({ request }) => {
    const { body } = await trpcQuery(request, 'getInfiniteProducts', { limit: 100, query: { category: 'icons' } })
    expect(body.result.data.items).toEqual([])
  })

  test('paginates with a cursor', async ({ request }) => {
    // the client (productReel) sends the page size inside `query`; the top-level `limit` is ignored by the procedure
    const first = await trpcQuery(request, 'getInfiniteProducts', { limit: 1, query: { limit: 1 } })
    expect(first.body.result.data.items).toHaveLength(1)
    expect(first.body.result.data.nextPage).toBe(2)

    const second = await trpcQuery(request, 'getInfiniteProducts', { limit: 1, cursor: 2, query: { limit: 1 } })
    expect(second.body.result.data.items).toHaveLength(1)
    expect(second.body.result.data.items[0].id).not.toBe(first.body.result.data.items[0].id)
  })
})
