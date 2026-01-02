// src/lib/analytics.ts
/* Lightweight analytics wrapper:
   - Works with Plausible (window.plausible)
   - Works with PostHog (window.posthog)
   - Works with GA4 gtag (window.gtag)
   - No-op if none is present
*/

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, any> }) => void
    posthog?: { capture: (event: string, props?: Record<string, any>) => void }
    gtag?: (...args: any[]) => void
  }
}

export const Events = {
  // existing keys you already had
  ViewProduct: 'view_product',
  AddToCart: 'add_to_cart',
  StartCheckout: 'start_checkout',
  PaymentSuccess: 'payment_success',
  RestoreCart: 'restore_cart',
  ApplyVoucher: 'apply_voucher',
  ApplyReferral: 'apply_referral',
  SubscribePlan: 'subscribe_plan',

  // NEW keys used by Gateway.tsx
  GatewayView: 'gateway_view',
  PaymentMethodSelected: 'payment_method_selected',
  PaymentTimeout: 'payment_timeout',
  PaymentRegenerate: 'payment_regenerate',
  PaymentCancel: 'payment_cancel',
} as const

export type EventName = (typeof Events)[keyof typeof Events]

/** Fire analytics event safely */
export function track(name: EventName | string, props?: Record<string, any>) {
  try {
    // Plausible
    if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
      window.plausible(name, props ? { props } : undefined)
    }
    // PostHog
    if (typeof window !== 'undefined' && window.posthog && typeof window.posthog.capture === 'function') {
      window.posthog.capture(name, props)
    }
    // GA4
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', name, props ?? {})
    }
    // Fallback: dev console
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[analytics]', name, props ?? {})
    }
  } catch {
    // swallow
  }
}
