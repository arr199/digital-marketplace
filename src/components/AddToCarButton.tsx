'use client'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'

export default function AddToCartButton (): JSX.Element {
  const [isSuccess, setIsSuccess] = useState<boolean>()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSuccess(false)
    }, 2000)
    return () => { clearTimeout(timer) }
  }, [isSuccess])
  return (
    <Button
    onClick={() => { setIsSuccess(true) } }
    className='w-full'> {isSuccess ? 'Added to Cart' : 'Add to Cart'}</Button>
  )
}
