'use client'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { useCart } from '@/hooks/useCart'
import { type Product } from '@/server/payload-types'
import { cn } from '@/lib/utils'

export default function AddToCartButton ({ product }: { product: Product }): JSX.Element {
  const [isSuccess, setIsSuccess] = useState<boolean>()
  const { addItem } = useCart()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSuccess(false)
    }, 2000)
    return () => { clearTimeout(timer) }
  }, [isSuccess])
  return (
    <Button
    onClick={() => {
      addItem(product)
      setIsSuccess(true)
    } }
    disabled={isSuccess}
    className={cn('w-full', {
      'bg-blue-600 hover:bg-blue-600 ': isSuccess
    })}>
    {isSuccess ? 'Added!' : 'Add to Cart'}
    </Button>
  )
}
