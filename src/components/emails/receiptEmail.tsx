import React from 'react'
import { formatPrice } from '../../lib/utils'
import { type Product } from '../../server/payload-types'
import format from 'date-fns/format'
import { render } from '@react-email/components'

interface ReceiptEmailProps {
  date: Date
  email: string
  products: Product[]
  orderId: string
}

function ReceiptEmail ({ date, email, orderId, products }: ReceiptEmailProps): JSX.Element {
  const totalPrice = products.reduce((acc, curr) => acc + curr.price, 0)
  return (
    <div className='flex flex-col '>
      <h1 className='text-2xl'>This is the receipt</h1>
      <p>{email}</p>
      <p>OrderId : {orderId}</p>
      <p>Price : {formatPrice(totalPrice) }</p>
      <p>Date {format(date, 'dd mm yyyy') }</p>
    </div>
  )
}

export function receiptEmailHtml (props: ReceiptEmailProps): string {
  return render(<ReceiptEmail {...props}></ReceiptEmail>, { pretty: true })
}
