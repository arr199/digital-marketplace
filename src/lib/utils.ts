import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn (...inputs: ClassValue[]): any {
  return twMerge(clsx(inputs))
}

export function formatPrice (
  price: number | string,
  options: {
    currency?: 'USD' | 'EUR' | 'GBP' | 'BDT'
    notation?: Intl.NumberFormatOptions['notation'] } = {}
): string {
  const { currency = 'USD', notation = 'compact' } = options
  const numberPrice = typeof price === 'string' ? Number(price) : price

  return new Intl.NumberFormat('en-US',
    { style: 'currency', currency, notation, maximumFractionDigits: 2 })
    .format(numberPrice)
}
