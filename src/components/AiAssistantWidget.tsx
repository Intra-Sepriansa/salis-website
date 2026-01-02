import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Send, Sparkles, StopCircle, X } from 'lucide-react'
import { streamOllamaChat, type ChatMessage } from '../lib/ollama'
import { AI_FACTS_MESSAGE } from '../lib/aiFacts'
import { CS_SYSTEM_PROMPT } from '../lib/aiPrompt'
import { formatIDR } from '../lib/format'
import { VOUCHERS } from '../lib/voucher'
import { products } from '../data/products'
import { FLAGS } from '../lib/flags'

const LOGO_SRC = '/assets/logo-salis.png'

const SYSTEM_PROMPT = [CS_SYSTEM_PROMPT, '', 'Data dinamis toko:', AI_FACTS_MESSAGE].join('\n')
const FAST_RESPONSE_TIMEOUT_MS = 4500
const ADMIN_WHATSAPP_NUMBER = '6285817254544'

const VOUCHER_QUICK_SUMMARY =
  VOUCHERS.length > 0
    ? VOUCHERS.map((voucher) => {
        const value =
          voucher.rule.type === 'percent' ? `${voucher.rule.value}%` : formatIDR(voucher.rule.value)
        const minLine = voucher.minSubtotal ? `min ${formatIDR(voucher.minSubtotal)}` : 'tanpa minimum'
        const note = voucher.note ? `, ${voucher.note}` : ''
        return `${voucher.code} (${value}, ${minLine}${note})`
      }).join(' | ')
    : 'Belum ada voucher aktif.'

const BEST_SELLER_SUMMARY = (() => {
  const picks = products
    .filter((product) => product.isRecommended || (product.baseRating ?? 0) >= 4.8)
    .slice(0, 3)
  if (!picks.length) return 'Produk favorit kami ready stok di katalog.'
  return picks
    .map((product) => {
      const stockInfo = typeof product.stock === 'number' ? `stok ${product.stock}` : 'cek stok'
      return `${product.name} ${formatIDR(product.price)} (${stockInfo})`
    })
    .join(' | ')
})()

const SHIPPING_QUICK_LINE = `Pengiriman rata-rata siap H+1/H+2 dengan ongkir standar ${formatIDR(
  FLAGS.defaultShippingFee
)}.`

const createTimeoutResponse = (question: string) => {
  const normalized = question.trim().toLowerCase()
  const lines = ['Maaf ya, AI lagi agak lambat beberapa detik. Ini respons kilat:']
  let added = false

  if (/(promo|voucher|diskon|kode)/.test(normalized)) {
    lines.push(`- Voucher aktif: ${VOUCHER_QUICK_SUMMARY}`)
    added = true
  }

  if (/(stok|ready|produk|menu|harga|varian|cake|kue|donat|bread|roti)/.test(normalized)) {
    lines.push(`- Produk favorit ready: ${BEST_SELLER_SUMMARY}`)
    added = true
  }

  if (/(order|pesanan|status|resi|tracking)/.test(normalized)) {
    lines.push('- Status pesanan: kirim ID order atau nomor telepon, nanti aku cek real-time ya.')
    added = true
  }

  if (/(kirim|antar|ongkir|delivery|shipping|kirimnya)/.test(normalized)) {
    lines.push(`- ${SHIPPING_QUICK_LINE}`)
    added = true
  }

  if (!added) {
    lines.push(`- Voucher aktif: ${VOUCHER_QUICK_SUMMARY}`)
    lines.push(`- Produk favorit ready: ${BEST_SELLER_SUMMARY}`)
  }

  lines.push(`Jika butuh detail lengkap, balas lagi atau hubungi admin via WA ${ADMIN_WHATSAPP_NUMBER}.`)
  return lines.join('\n')
}

const quickPrompts = [
  'Produk apa yang lagi ready stock hari ini?',
  'Bagaimana cara cek status order saya?',
  'Apakah ada promo atau voucher minggu ini?',
]

export default function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hai! Saya asisten AI Salis. Tanya apa saja soal pesanan & produk ya.' },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [showTyping, setShowTyping] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const slowTimerRef = useRef<number | null>(null)
  const responseDeadlineRef = useRef<number | null>(null)
  const hasReceivedTokenRef = useRef(false)

  const clearSlowTimer = () => {
    if (slowTimerRef.current) {
      window.clearTimeout(slowTimerRef.current)
      slowTimerRef.current = null
    }
  }

  const clearResponseDeadline = () => {
    if (responseDeadlineRef.current) {
      window.clearTimeout(responseDeadlineRef.current)
      responseDeadlineRef.current = null
    }
  }

  useEffect(() => {
    const media = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
    if (!media) return
    const update = () => setReduceMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isOpen])

  useEffect(() => {
    if (isLoading) {
      const id = window.setTimeout(() => setShowTyping(true), 200)
      return () => window.clearTimeout(id)
    }
    setShowTyping(false)
  }, [isLoading])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  const handleOpen = () => setIsOpen(true)

  const handleClose = () => {
    abortRef.current?.abort()
    clearSlowTimer()
    clearResponseDeadline()
    setIsLoading(false)
    setIsOpen(false)
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = { role: 'user', content: input.trim() }
    setInput('')

    let assistantIndex = 0
    setMessages((prev) => {
      assistantIndex = prev.length + 1
      return [...prev, userMessage, { role: 'assistant', content: '' }]
    })

    const history = [...messages, userMessage]
    const controller = new AbortController()
    abortRef.current = controller
    hasReceivedTokenRef.current = false
    setShowTyping(true)
    setIsLoading(true)
    let buffer = ''

    clearSlowTimer()
    slowTimerRef.current = window.setTimeout(() => {
      if (hasReceivedTokenRef.current) return
      setMessages((prev) => {
        const next = [...prev]
        const placeholder = buffer || 'Sebentar ya, lagi memproses...'
        next[assistantIndex] = { role: 'assistant', content: placeholder }
        return next
      })
    }, 1800)

    clearResponseDeadline()
    responseDeadlineRef.current = window.setTimeout(() => {
      if (hasReceivedTokenRef.current) return
      responseDeadlineRef.current = null
      clearSlowTimer()
      hasReceivedTokenRef.current = true
      const fallbackAnswer = createTimeoutResponse(userMessage.content)
      setMessages((prev) => {
        const next = [...prev]
        next[assistantIndex] = { role: 'assistant', content: fallbackAnswer }
        return next
      })
      setIsLoading(false)
      setShowTyping(false)
      controller.abort()
    }, FAST_RESPONSE_TIMEOUT_MS)

    try {
      await streamOllamaChat({
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
        signal: controller.signal,
        onToken: (chunk) => {
          buffer += chunk
          hasReceivedTokenRef.current = true
          clearSlowTimer()
          clearResponseDeadline()
          setMessages((prev) => {
            const next = [...prev]
            next[assistantIndex] = { role: 'assistant', content: buffer }
            return next
          })
        },
      })
    } catch (error) {
      const aborted =
        (error instanceof DOMException && error.name === 'AbortError') ||
        (error instanceof Error && error.name === 'AbortError')
      if (!aborted) {
        const detail = error instanceof Error ? error.message : 'Server Ollama tidak tersedia.'
        buffer = buffer || 'Maaf, ada kendala teknis saat memproses pesanmu.'
        setMessages((prev) => {
          const next = [...prev]
          next[assistantIndex] = { role: 'assistant', content: `${buffer}\n\n(Detail: ${detail})` }
          return next
        })
      }
    } finally {
      setIsLoading(false)
      setShowTyping(false)
      clearSlowTimer()
      clearResponseDeadline()
      abortRef.current = null
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
    clearSlowTimer()
    clearResponseDeadline()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleSend()
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const hasConversation = messages.length > 1

  return (
    <div className="fixed left-4 bottom-24 z-50 md:left-8 md:bottom-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="ai-widget"
            initial={{ opacity: 0, y: 18, scale: reduceMotion ? 1 : 0.86 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: reduceMotion ? 1 : 0.9 }}
            transition={
              reduceMotion
                ? { type: 'tween', duration: 0.2 }
                : { type: 'tween', duration: 0.26, ease: 'easeOut' }
            }
            style={{ transformOrigin: 'bottom left' }}
            className="mb-3 w-[min(380px,calc(100vw-1.5rem))] overflow-hidden rounded-3xl border border-[var(--border)] bg-white/95 shadow-[var(--shadow-strong)] backdrop-blur-sm dark:bg-[var(--bg-elevated)]/95"
          >
            <motion.div
              initial={{ opacity: 0, y: 6, scale: reduceMotion ? 1 : 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={
                reduceMotion
                  ? { type: 'tween', duration: 0.18 }
                  : { type: 'tween', duration: 0.22, ease: 'easeOut', delay: 0.02 }
              }
              className="flex items-start gap-3 border-b border-[var(--border)] px-4 py-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)]/10">
                <img src={LOGO_SRC} alt="Salis Shop" className="h-8 w-8 rounded-xl bg-white object-contain p-1 shadow-sm" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--muted-foreground)]">Salis AI</p>
                <p className="text-base font-semibold text-[var(--fg)]">Customer Service Salis</p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--muted)]/60 hover:text-[var(--fg)]"
                aria-label="Tutup chat"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10, scale: reduceMotion ? 1 : 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={
                reduceMotion
                  ? { type: 'tween', duration: 0.2 }
                  : { type: 'tween', duration: 0.26, ease: 'easeOut', delay: 0.04 }
              }
              className="flex h-[600px] flex-col gap-3 px-4 py-3 md:h-[660px]"
            >
              <motion.div
                ref={listRef}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                transition={
                  reduceMotion
                    ? { type: 'tween', duration: 0.18 }
                    : { type: 'tween', duration: 0.2, ease: 'easeOut', delay: 0.06 }
                }
                className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-[var(--border)] bg-white/80 p-3 text-sm leading-relaxed shadow-inner dark:bg-[var(--bg-elevated)]/80"
              >
                {messages.map((message, index) => {
                  const displayContent = (message.content ?? '').replace(/\*\*/g, '')
                  const isAssistant = message.role === 'assistant'
                  const textClass = isAssistant ? 'text-[var(--fg)]' : 'text-white'
                  return (
                    <div
                      key={`${message.role}-${index}`}
                      className={
                        isAssistant
                          ? 'max-w-[85%] rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-[var(--fg)] shadow-sm dark:bg-[var(--bg-elevated)]/80'
                          : 'ml-auto max-w-[85%] rounded-2xl bg-[#b64213] px-3 py-2 text-white shadow-sm'
                      }
                      aria-live={isAssistant ? 'polite' : undefined}
                    >
                      <p className={`whitespace-pre-wrap ${textClass}`}>{displayContent || '...'}</p>
                    </div>
                  )
                })}
                {showTyping && (
                  <div className="flex items-center gap-2 text-xs font-medium text-[var(--muted-foreground)]">
                    <span className="inline-flex h-2 w-2 animate-ping rounded-full bg-[var(--primary)]" />
                    AI mengetik...
                  </div>
                )}
              </motion.div>

              {!hasConversation && (
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => {
                        setInput(prompt)
                        setIsOpen(true)
                      }}
                      className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs text-[var(--fg)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-[var(--shadow-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] dark:bg-[var(--bg-elevated)]/80"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="rounded-2xl border border-[var(--border)] bg-white/90 px-3 py-2 shadow-sm transition ring-offset-2 focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--ring)] focus-within:ring-offset-white dark:bg-[var(--bg-elevated)]/80">
                  <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    <Bot className="h-4 w-4 text-[var(--primary)]" /> Tulis pertanyaanmu
                  </div>
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Tanya apapun.."
                      className="w-full rounded-2xl border border-[var(--border)] bg-white/95 px-3 py-3 pr-14 text-sm text-[var(--fg)] shadow-inner transition focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90"
                    />
                    <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-2">
                      {!isLoading && (
                        <button
                          type="submit"
                          disabled={!input.trim()}
                          aria-label="Kirim"
                          className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-soft transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                      {isLoading && (
                        <button
                          type="button"
                          onClick={handleStop}
                          aria-label="Hentikan"
                          className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--muted-foreground)] shadow-soft transition hover:border-[var(--primary)] dark:bg-[var(--bg-elevated)]/80"
                        >
                          <StopCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={handleOpen}
        className="group inline-flex items-center gap-3 rounded-full bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow-strong)] transition hover:translate-y-[-1px] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
        aria-label="Buka asisten AI Salis"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--primary)] shadow-sm ring-4 ring-white/40">
          <img src={LOGO_SRC} alt="Salis Shop" className="h-8 w-8 rounded-full object-contain" />
        </span>
        <div className="flex flex-col items-start leading-tight">
          <span className="text-[11px] uppercase tracking-[0.28em] text-[var(--primary-foreground)]/80">Ada pertanyaan?</span>
          <span className="flex items-center gap-1 text-base">
            <Sparkles className="h-4 w-4" /> Tanya Salis AI
          </span>
        </div>
      </button>
    </div>
  )
}
