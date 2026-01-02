// src/data/products.ts
import type { Product } from '../types'

export const products: Product[] = [
  {
    id: 'prod-dimsum',
    slug: 'dimsum-ayam-udang',
    name: 'Dimsum Ayam Udang',
    category: 'Savory' as any,
    price: 10000,
    img: 'assets/products/dimsum.png',
    stock: 42,
    baseRating: 4.8,
    baseReviewCount: 132,
    isRecommended: true,
    description:
      'Dimsum kukus berisi campuran ayam dan udang dengan saus cocol homemade.',
    tags: ['frozen ready', 'favourite', 'gurih'],
    variants: [{ label: 'Porsi', options: ['10 pcs', '20 pcs'] }],
    allergens: ['udang', 'gluten'],
    halal: true,
  },
  {
    id: 'prod-nastar',
    slug: 'nastar-klassik',
    name: 'Nastar Klasik',
    category: 'Cookies' as any,
    price: 10000,
    img: 'assets/products/nastar.png',
    stock: 65,
    baseRating: 4.9,
    baseReviewCount: 95,
    isRecommended: true,
    description:
      'Kue nastar isi selai nanas homemade dengan mentega premium.',
    tags: ['seasonal', 'best seller'],
    variants: [{ label: 'Ukuran Toples', options: ['400 gr', '650 gr'] }],
    allergens: ['telur', 'gluten'],
    halal: true,
  },
  {
    id: 'prod-crepes-rv',
    slug: 'miles-crefes-red-velvet',
    name: 'Miles Crepes Red Velvet',
    category: 'Cakes' as any,
    price: 215000,
    img: 'assets/products/miles-crefes-rv.png.jpg',
    stock: 15,
    baseRating: 4.9,
    baseReviewCount: 210,
    isRecommended: true,
    description:
      'Crepes cake red velvet dengan lapisan krim keju lembut khas Salis.',
    tags: ['celebration', 'signature'],
    variants: [{ label: 'Ukuran', options: ['16 cm', '20 cm'] }],
    allergens: ['dairy', 'gluten', 'telur'],
    halal: true,
    selling: {
      modes: ['whole'],
      unitLabel: 'loyang',
      whole: {
        sizes: [
          { label: '16 cm', price: 215000 },
          { label: '20 cm', price: 285000 },
        ],
      },
    },
  },
  {
    id: 'prod-brownies',
    slug: 'brownies-fudge-classic',
    name: 'Brownies Fudge Classic',
    category: 'Brownies' as any,
    price: 89000,
    img: 'assets/products/brownis.png',
    stock: 28,
    baseRating: 4.7,
    baseReviewCount: 165,
    description:
      'Brownies cokelat pekat dengan tekstur fudgy dan topping choco chips.',
    tags: ['cokelat', 'family size'],
    allergens: ['telur', 'gluten'],
    halal: true,
  },
  {
    id: 'prod-crepes-matcha',
    slug: 'miles-crefes-matcha',
    name: 'Miles Crepes Matcha',
    category: 'Cakes' as any,
    price: 225000,
    img: 'assets/products/miles-crefes-matcha.png',
    stock: 15,
    baseRating: 4.85,
    baseReviewCount: 88,
    description:
      'Lapisan crepes tipis dengan krim matcha Jepang bertenor umami.',
    tags: ['premium', 'green tea'],
    variants: [{ label: 'Ukuran', options: ['16 cm'] }],
    allergens: ['dairy', 'gluten', 'telur'],
    halal: true,
    selling: {
      modes: ['whole'],
      unitLabel: 'loyang',
      whole: { sizes: [{ label: '16 cm', price: 225000 }] },
    },
  },
  {
    id: 'prod-crepes-choco',
    slug: 'miles-crefes-coklat',
    name: 'Miles Crepes Coklat',
    category: 'Cakes' as any,
    price: 209000,
    img: 'assets/products/miles-crefes-coklat.png',
    stock: 18,
    baseRating: 4.75,
    baseReviewCount: 77,
    description:
      'Varian cokelat dengan krim belgian chocolate dan taburan cacao nibs.',
    tags: ['cokelat', 'signature'],
    variants: [{ label: 'Ukuran', options: ['16 cm'] }],
    allergens: ['dairy', 'gluten', 'telur'],
    halal: true,
    selling: {
      modes: ['whole'],
      unitLabel: 'loyang',
      whole: { sizes: [{ label: '16 cm', price: 209000 }] },
    },
  },
  {
    id: 'prod-donut',
    slug: 'donut-classic',
    name: 'Donut Classic Glaze',
    category: 'Donuts' as any,
    price: 10000,
    img: 'assets/products/donut.png',
    stock: 55,
    baseRating: 4.6,
    baseReviewCount: 59,
    description:
      'Donat kentang dengan glaze vanilla dan taburan sprinkles warna-warni.',
    tags: ['snack time', 'kids favourite'],
    allergens: ['telur', 'gluten', 'dairy'],
    halal: true,
    selling: {
      modes: ['piece'],
      unitLabel: 'potong',
      piece: {
        pricePerPiece: 10000,
        minQty: 1,
        tiers: [
          { minQty: 6, price: 9200 },
          { minQty: 12, price: 8500 },
        ],
      },
    },
  },
  {
    id: 'prod-cookies',
    slug: 'soft-baked-cookies',
    name: 'Soft Baked Cookies',
    category: 'Cookies' as any,
    price: 45000,
    img: 'assets/products/cookies.png',
    stock: 70,
    baseRating: 4.65,
    baseReviewCount: 103,
    description:
      'Cookie chewy dengan dark chocolate chunk dan sea salt flakes.',
    tags: ['fresh bake', 'snack'],
    allergens: ['telur', 'gluten'],
    halal: true,
  },
  {
    id: 'prod-pizza-mini',
    slug: 'pizza-mini-delight',
    name: 'Pizza Mini Delight',
    category: 'Savory' as any,
    price: 60000,
    img: 'assets/products/pizaamini.png',
    stock: 40,
    baseRating: 4.55,
    baseReviewCount: 84,
    description:
      'Pizza mini dengan topping pepperoni ayam, saus homemade, dan keju mozarella.',
    tags: ['party tray', 'frozen ready'],
    allergens: ['dairy', 'gluten'],
    halal: true,
  },
  {
    id: 'prod-crepes-lapis',
    slug: 'miles-crefes-tiramisu',
    name: 'Miles Crepes Tiramisu',
    category: 'Cakes' as any,
    price: 219000,
    img: 'assets/products/miles-crefes-coklat.png',
    stock: 10,
    baseRating: 4.95,
    baseReviewCount: 44,
    isRecommended: true,
    description:
      'Perpaduan kopi espresso dan mascarpone dalam 25 lapisan crepes.',
    tags: ['limited', 'coffee'],
    variants: [{ label: 'Ukuran', options: ['16 cm'] }],
    allergens: ['dairy', 'gluten', 'telur'],
    halal: true,
    selling: {
      modes: ['whole'],
      unitLabel: 'loyang',
      whole: { sizes: [{ label: '16 cm', price: 219000 }] },
    },
  },
]

// helper lama (kalau masih ada yang pakai)
export const getProductBySlug = (slug: string) =>
  products.find((product) => product.slug === slug)

export const getProductsByCategory = (category: string) =>
  products.filter((product) => product.category === category)

export const getRecommendedProducts = () =>
  products.filter((product) => product.isRecommended)

export const searchProducts = (query: string) => {
  const needle = query.trim().toLowerCase()
  if (!needle) return products
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(needle) ||
      (product.tags ?? []).some((tag) => tag.toLowerCase().includes(needle))
  )
}
