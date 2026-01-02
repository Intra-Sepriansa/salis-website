// src/components/review/ReviewForm.tsx
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import RatingStars from './RatingStars'
import { useReviewsStore } from '../../store/reviews'
import { useUserStore } from '../../store/user'
import { useAdminOrdersStore } from '../../store/adminOrders'
import { useToastStore } from '../../store/ui'

/**
 * Schema:
 * - rating wajib 1..5
 * - comment opsional (maks 300). Kita biarkan opsional di INPUT tipe-nya,
 *   supaya resolver tidak bentrok dengan RHF. Nanti kita normalisasi ke string saat submit.
 */
const schema = z.object({
  rating: z.number().min(1, 'Minimal 1 bintang').max(5, 'Maksimal 5 bintang'),
  comment: z.string().max(300, 'Komentar maksimal 300 karakter').optional(),
})

// Gunakan tipe INPUT schema untuk RHF (bukan z.infer/output) agar cocok dengan resolver
type FormValues = z.input<typeof schema>

type ReviewFormProps = {
  productId: string
  orderId: string
  orderItemId: string
  onSubmitted?: (reviewId: string) => void
}

export default function ReviewForm({ productId, orderId, orderItemId, onSubmitted }: ReviewFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const pushToast = useToastStore((s) => s.push)
  const profile = useUserStore((s) => s.profile)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      rating: 5,
      comment: '', // boleh ada walau opsional, ini nyaman buat textarea terkontrol
    },
    mode: 'onBlur',
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true)

    // Normalisasi komentar -> string
    const comment = (values.comment ?? '').trim()

    const review = useReviewsStore.getState().add({
      orderId,
      orderItemId, // sudah didukung di tipe store
      productId,
      userName: profile?.name ?? 'Pelanggan',
      rating: values.rating,
      comment, // store mengharapkan string, aman
    })

    // Tandai item sudah direview (opsional jika func belum ada)
    useUserStore.getState().markItemReviewed?.(orderId, orderItemId, review.id)
    useAdminOrdersStore.getState().markItemReviewed?.(orderId, orderItemId, review.id)

    pushToast({
      title: 'Terima kasih atas ulasanmu!',
      tone: 'success',
      description: 'Review akan tampil setelah disetujui admin.',
      duration: 3600,
    })

    setSubmitting(false)
    setSubmitted(true)
    onSubmitted?.(review.id)
    form.reset({ rating: 5, comment: '' })
  })

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/40 dark:text-emerald-100">
        Ulasan sudah dikirim. Menunggu persetujuan admin.
      </div>
    )
  }

  const commentLen = (form.watch('comment') ?? '').length

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-[var(--border)] bg-white/90 p-4 text-sm text-[var(--muted-foreground)] shadow-soft dark:bg-[var(--bg-elevated)]/90"
    >
      <div>
        <p className="font-semibold text-[var(--fg)]">Beri rating</p>
        <Controller
          name="rating"
          control={form.control}
          render={({ field }) => (
            <div className="mt-2">
              <RatingStars value={field.value} onChange={field.onChange} id={`rate-${orderItemId}`} />
              {form.formState.errors.rating && (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.rating.message}</p>
              )}
            </div>
          )}
        />
      </div>

      <label className="block space-y-1">
        <span className="text-xs uppercase tracking-[0.25em] text-[var(--muted-foreground)]">Komentar (opsional)</span>
        <textarea
          rows={3}
          className="w-full rounded-2xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none"
          {...form.register('comment')}
          maxLength={300}
          placeholder="Bagikan pengalamanmu menikmati produk ini"
        />
        <div className="flex items-center justify-between">
          {form.formState.errors.comment && (
            <span className="text-xs text-red-500">{form.formState.errors.comment.message}</span>
          )}
          <span className="text-xs opacity-60">{commentLen}/300</span>
        </div>
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[var(--primary-foreground)] shadow-soft transition hover:brightness-110 disabled:opacity-60"
        >
          {submitting ? 'Mengirim...' : 'Kirim review'}
        </button>
      </div>
    </form>
  )
}
