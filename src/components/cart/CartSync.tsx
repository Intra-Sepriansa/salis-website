import { useEffect } from 'react'
import { useCartStore } from '../../store/cart'
import { saveCart } from '../../lib/cartPersistence'

/** Sinkronkan isi cart ke localStorage untuk abandoned-cart recovery */
export default function CartSync() {
  const items = useCartStore((s) => s.items)
  useEffect(() => { saveCart(items) }, [items])
  return null
}
