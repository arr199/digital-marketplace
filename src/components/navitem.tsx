'use client'
import type API from '@/lib/API'
import { Button } from './ui/button'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import clsx from 'clsx'
import Link from 'next/link'

type Category = (typeof API.PRODUCT_CATEGORIES)[number]

interface NavItemsProps {
  category: Category
  handleOpen: () => void
  isOpen: boolean
  isAnyOpen: boolean
}

export default function NavItem ({
  category,
  isAnyOpen,
  handleOpen,
  isOpen
}: NavItemsProps): JSX.Element {
  return (
    <div className="flex">
      <div className="relative flex items-center  ">
        <Button
          className="gap-1.5"
          onClick={handleOpen}
          variant={isOpen ? 'secondary' : 'ghost'}
        >
          {category.label}
          <ChevronDown
            className={clsx('h4 w-4 transition-all text-muted-foreground', {
              '-rotate-180': isOpen
            })}
          ></ChevronDown>
        </Button>
      </div>
      {/* OPEN BUTTON */}

      {isOpen
        ? (
        <div
          className={clsx(
            'absolute  inset-x-0 text-sm top-full text-muted-foreground ',
            {
              'animate-in fade-in-10 slide-in-from-top-5': !isAnyOpen
            }
          )}
        >
          <div
            className="absolute inset-0 top-1/2  bg-white shadow "
            aria-hidden="true"
          />
          <div className="relative  bg-white ">
            <div className="mx-auto max-w-7xl px-8  h-[50vh]">
              <div className="grid grid-cols-4 gap-x-8 gap-y-10 py-16 ">
                <div className="col-span-4 col-start-1 grid grid-cols-3 gap-x-8 ">
                  {category.featured.map((item) => (
                    <div
                      className="group relative  text-base sm-text-sm"
                      key={item.name}
                    >
                      <div className="p-4 relative aspect-video overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75 shadow-sm">
                        <Image
                          alt="products category image"
                          src={item.imageSrc}
                          fill
                          className="object-cover object-center"
                        ></Image>
                      </div>
                      <div className="flex flex-col text-sm">
                        <Link
                          className="mt-6 block font-medium text-gray-900 "
                          href={item.href}
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1" aria-hidden="true">
                          Shop Now
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
          )
        : null}
    </div>
  )
}
