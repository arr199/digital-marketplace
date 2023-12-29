'use client'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { useCart } from '@/hooks/useCart'
import { type Product } from '@/server/payload-types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function AddToCartButton ({ product }: { product: Product }): JSX.Element {
  const [isSuccess, setIsSuccess] = useState<boolean>()
  const { addItem, items } = useCart()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSuccess(false)
    }, 1000)
    return () => { clearTimeout(timer) }
  }, [isSuccess])
  return (

    <Button
    onClick={() => {
      if (items.some(item => item.product.id === product.id)) {
        toast.error('Product Already in the cart', { position: 'top-right' })
        setIsSuccess(true)
        return
      }
      addItem(product)
      setIsSuccess(true)
    } }
    disabled={isSuccess}
    className={cn('w-full mt-4', {
      'bg-blue-600 hover:bg-blue-600 ': isSuccess
    })}>
    {isSuccess ? 'Added!' : 'Add to Cart'}
    </Button>
  )
}
