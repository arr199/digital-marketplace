import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Digital Marketplace',
  description: 'Your marketplace for digital assets',
  creator: 'abiel'
}

export default function RootLayout ({
  children
}: {
  children: React.ReactNode
}): React.ReactElement {
  return <>{children}</>
}
