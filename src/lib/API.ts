const API = {
  PRODUCT_CATEGORIES: [
    {
      label: 'UI Kits',
      value: 'ui_kits' as const,
      featured: [
        {
          name: 'Editor picks',
          href: '/products?category=ui_kits',
          imageSrc: '/nav/ui-kits/mixed.jpg'
        },
        {
          name: 'New Arrivals',
          href: '/products?category=ui_kits',
          imageSrc: '/nav/ui-kits/blue.jpg'
        },
        {
          name: 'Bestsellers',
          href: '/products?category=ui_kits',
          imageSrc: '/nav/ui-kits/purple.jpg'
        }
      ]
    },
    {
      label: 'Icons',
      value: 'icons' as const,
      featured: [
        {
          name: 'Favorite Icons Picks',
          href: '/products?category=icons',
          imageSrc: '/nav/icons/picks.jpg'
        },
        {
          name: 'New Arrivals',
          href: '/products?category=icons',
          imageSrc: '/nav/icons/new.jpg'
        },
        {
          name: 'Bestsellers',
          href: '/products?category=icons',
          imageSrc: '/nav/icons/bestsellers.jpg'
        }
      ]
    }
  ],
  TRANSACTION_FEE: 1
}

export default API
