export type Category = 'Cakes' | 'Brownies' | 'Cookies' | 'Donuts' | 'Savory' | 'Buns'

export type ProductVariant = {
  label: string
  options: string[]
}

export type Product = {
  id: string
  slug: string
  name: string
  category: Category
  price: number
  img: string
  stock: number
  description: string
  tags: string[]
  variants?: ProductVariant[]
  allergens?: string[]
  weightGram?: number
  halal?: boolean
  isRecommended?: boolean
  baseRating: number
  baseReviewCount: number
}

export type CartItem = {
  productId: string
  qty: number
  variant?: string
}

export type PaymentCategory = 'bank' | 'ewallet' | 'qris' | 'cod'

export type PaymentMethodId =
  | 'bank-bca'
  | 'bank-bni'
  | 'bank-bri'
  | 'bank-mandiri'
  | 'ewallet-ovo'
  | 'ewallet-gopay'
  | 'ewallet-dana'
  | 'ewallet-shopeepay'
  | 'qris'
  | 'cod'

export type ShippingInfo = {
  name: string
  phone: string
  address: string
  note?: string
}

export type OrderItem = {
  id: string
  productId: string
  name: string
  img: string
  price: number
  qty: number
  subtotal: number
  variant?: string
  reviewId?: string
}

export type OrderStatus = 'Processing' | 'Shipped' | 'Completed' | 'Cancelled'

export type Order = {
  id: string
  trx: string
  customerId: string
  method: string
  methodLabel?: string
  methodType?: PaymentCategory | 'cod'
  total: number
  subtotal: number
  shippingFee: number
  discount?: number
  createdAt: number
  updatedAt: number
  status: OrderStatus
  items: OrderItem[]
  shipping: ShippingInfo
  note?: string
}

export type Address = {
  id: string
  label: string
  detail: string
  note?: string
  isDefault?: boolean
}

export type ThemeMode = 'light' | 'dark'

export type UserProfile = {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  avatar?: string
  customerId: string
}

export type Review = {
  id: string
  orderId: string
  orderItemId: string
  productId: string
  userName: string
  rating: number
  comment?: string
  createdAt: number
  approved: boolean
}
