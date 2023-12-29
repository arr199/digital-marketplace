'use client'

import { useCart } from '@/hooks/useCart'
import { trpc } from '@/trpc/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface PaymentStatusProps {
  orderEmail: string
  orderId: string
  isPaid: boolean
}

export default function PaymentStatus ({ isPaid, orderEmail, orderId }: PaymentStatusProps): JSX.Element {
  const router = useRouter()
  const { clearCart } = useCart()
  const { data } = trpc.payment.pollOrderStatus.useQuery({ orderId }, {
    enabled: !isPaid,
    refetchInterval: (data) => {
      return data?.isPaid ? false : 1000
    }
  })

  useEffect(() => {
    if (isPaid || data?.isPaid) {
      clearCart()
      router.refresh()
    }
    if (data?.isPaid) {
      router.refresh()
    }
  }, [data?.isPaid, router]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
   <div className=''>
      <div>
            <p className='mt-2'>Shipping To</p>
            <p className='mt-2'>{orderEmail}</p>
      </div>

   </div>
  )
}
