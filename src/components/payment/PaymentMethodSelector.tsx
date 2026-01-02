// src/components/payment/PaymentMethodSelector.tsx
import type { PaymentMethodId } from '../../types'
import { paymentSections } from '../../lib/payment'
import MethodCard from './MethodCard'

type Props = {
  value: PaymentMethodId
  onChange: (id: PaymentMethodId) => void
}

export default function PaymentMethodSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-6">
      {paymentSections.map((sec) => (
        <section key={sec.category} className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--fg)]">{sec.title}</h3>
            <p className="text-xs text-[var(--muted-foreground)]">{sec.description}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {sec.methods.map((m) => (
              <MethodCard
                key={m.id}
                method={m}
                checked={value === m.id}
                onChange={(id) => onChange(id as PaymentMethodId)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
