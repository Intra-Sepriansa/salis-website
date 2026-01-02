import React, { useId } from 'react'

type Props = {
  /** 0..5 (boleh pecahan untuk mode readOnly) */
  value?: number
  /** dipanggil saat user pilih rating (1..5) */
  onChange?: (value: number) => void
  /** kalau true: non-interaktif, tampilkan saja */
  readOnly?: boolean
  /** ukuran sisi ikon (px) */
  size?: number
  /** id untuk aria-labelledby (opsional) */
  id?: string
}

/** Path bintang (24x24) – dipakai untuk outline & fill */
const STAR_PATH =
  'M12 2.25l2.96 6 6.63.96-4.79 4.66 1.13 6.6L12 17.77 6.07 20.47l1.13-6.6-4.79-4.66 6.63-.96L12 2.25z'

/** Satu bintang dengan dukungan fill pecahan via clipPath */
function Star({
  fraction,
  active,
  size = 20,
  clipId,
}: {
  fraction: number // 0..1
  active: boolean
  size?: number
  clipId: string
}) {
  const w = 24 * Math.max(0, Math.min(1, fraction))
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className="inline-block"
      style={{ transition: 'transform .15s' }}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={w} height="24" />
        </clipPath>
      </defs>

      {/* Outline */}
      <path
        d={STAR_PATH}
        fill="none"
        stroke={active ? '#eab308' : '#9ca3af'} /* yellow-500 / gray-400 */
        strokeWidth="1.5"
      />

      {/* Fill dengan clip sesuai fraction */}
      <path d={STAR_PATH} clipPath={`url(#${clipId})`} fill="#eab308" />
    </svg>
  )
}

export default function RatingStars({
  value = 0,
  onChange,
  readOnly,
  size = 20,
  id,
}: Props) {
  const stars = [1, 2, 3, 4, 5]
  const uid = useId()

  // fraction per bintang: (nilai - index) dipotong 0..1
  const getFraction = (n: number) => Math.max(0, Math.min(1, value - (n - 1)))
  const isActive = (n: number) => value >= n

  return (
    <div
      role={readOnly ? undefined : 'radiogroup'}
      aria-labelledby={id}
      className="flex items-center gap-1"
    >
      {stars.map((n) => {
        const fraction = getFraction(n)
        const active = isActive(n)
        const clipId = `${uid}-star-${n}`

        const commonBtn =
          'rounded focus:outline-none focus-visible:ring-2 ring-offset-2 ring-yellow-300 disabled:opacity-60'

        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            role={readOnly ? undefined : 'radio'}
            aria-checked={readOnly ? undefined : active}
            aria-label={`${n} bintang`}
            onClick={() => !readOnly && onChange?.(n)}
            onKeyDown={(e) => {
              if (readOnly) return
              if (e.key === 'ArrowRight') {
                e.preventDefault()
                onChange?.(Math.min(5, (Math.round(value) || 0) + 1))
              }
              if (e.key === 'ArrowLeft') {
                e.preventDefault()
                onChange?.(Math.max(1, (Math.round(value) || 0) - 1))
              }
            }}
            className={commonBtn}
            style={{ lineHeight: 0 }}
          >
            <Star fraction={readOnly ? fraction : active ? 1 : 0} active={active} size={size} clipId={clipId} />
          </button>
        )
      })}
    </div>
  )
}
