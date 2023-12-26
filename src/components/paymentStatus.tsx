'use client'

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
  const { data } = trpc.payment.pollOrderStatus.useQuery({ orderId }, {
    enabled: !isPaid,
    refetchInterval: (data) => {
      return data?.isPaid ? false : 1000
    }
  })
  useEffect(() => {
    if (data?.isPaid) router.refresh()
  }, [data?.isPaid, router])

  return (
   <div className=''>
      <div>
            <p>Shipping To</p>
            <p>{orderEmail}</p>
      </div>

   </div>
  )
}
