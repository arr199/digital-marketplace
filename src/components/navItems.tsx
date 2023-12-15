'use client'

import API from '@/lib/API'
import NavItem from './navitem'
import React, { useEffect, useRef, useState } from 'react'
import { useOnClickOutside } from '@/lib/hooks'

export function NavItems (): JSX.Element {
  const [activeIndex, setActiveIndex] = useState<null | number>(null)
  const navItem = useRef<HTMLDivElement | null>(null)
  useOnClickOutside(navItem, () => { setActiveIndex(null) })

  useEffect(() => {
    function handler (e: KeyboardEventInit): void {
      if (e.key === 'Escape') {
        setActiveIndex(null)
      }
    }

    document.addEventListener('keydown', handler)
    return () => { document.removeEventListener('keydown', handler) }
  }, [])

  function handleOpen (index: number): void {
    if (activeIndex === index) {
      setActiveIndex(null)
    } else setActiveIndex(index)
  }

  //  JSX
  return (
    <div ref={navItem} className='flex gap-4 h-full'>
      {API.PRODUCT_CATEGORIES.map((category, index) =>
          <NavItem
            category={category}
            handleOpen={() => { handleOpen(index) }}
            isOpen={index === activeIndex}
            isAnyOpen={activeIndex !== null}
            key={index}
          >
          </NavItem>

      ) }
</div>)
}
