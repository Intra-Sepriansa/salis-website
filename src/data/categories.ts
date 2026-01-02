import type { Category } from '../types'

export type CategoryInfo = {
  id: Category
  label: string
  description: string
  highlightImage: string
  tagline: string
}

export const categories: CategoryInfo[] = [
  {
    id: 'Cakes',
    label: 'Signature Cakes',
    description: 'Layered crepes dan whole cakes racikan chef kami untuk momen spesial.',
    highlightImage: 'assets/products/miles-crefes-rv.png.jpg',
    tagline: 'Lembut dan kaya rasa, sempurna untuk perayaan kecil maupun besar.'
  },
  {
    id: 'Brownies',
    label: 'Brownies',
    description: 'Brownies fudge, brownies kukus, dan variasi dengan topping premium.',
    highlightImage: 'assets/products/brownis.png',
    tagline: 'Cokelat intens dengan tekstur fudgy yang bikin nagih.'
  },
  {
    id: 'Cookies',
    label: 'Cookies',
    description: 'Cookie artisanal dengan campuran cokelat, kacang, dan rempah pilihan.',
    highlightImage: 'assets/products/cookies.png',
    tagline: 'Renya di luar, empuk di dalam, cocok untuk temani ngopi.'
  },
  {
    id: 'Donuts',
    label: 'Donuts',
    description: 'Donat kentang fresh dengan glaze dan filling favorit keluarga.',
    highlightImage: 'assets/products/donut.png',
    tagline: 'Ringan, fluffy, dan manisnya pas untuk semua umur.'
  },
  {
    id: 'Savory',
    label: 'Savory Bites',
    description: 'Pilihan snack gurih seperti dimsum dan pizza mini siap santap.',
    highlightImage: 'assets/products/dimsum.png',
    tagline: 'Teman kumpul yang praktis dan nikmat dalam setiap gigitan.'
  },
  {
    id: 'Buns',
    label: 'Soft Buns',
    description: 'Roti lembut dengan isian manis dan gurih, favorit sarapan.',
    highlightImage: 'assets/products/pizaamini.png',
    tagline: 'Fluffy buns yang bikin pagi lebih seru dan mengenyangkan.'
  }
]

export const getCategoryInfo = (id: Category) =>
  categories.find((category) => category.id === id)

export const categoryIds: Category[] = categories.map((category) => category.id)
