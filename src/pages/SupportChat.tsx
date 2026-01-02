import { useEffect, useRef, useState } from 'react'
import { Image as ImageIcon, MessageCircle, RefreshCcw, Send, Sparkles, StopCircle, X } from 'lucide-react'
import MetaHead from '../components/MetaHead'
import { streamOllamaChat, type ChatMessage } from '../lib/ollama'
import { AI_FACTS_MESSAGE } from '../lib/aiFacts'
import { CS_SYSTEM_PROMPT } from '../lib/aiPrompt'

const SYSTEM_PROMPT = [CS_SYSTEM_PROMPT, '', 'Data dinamis toko:', AI_FACTS_MESSAGE].join('\n')

const quickPrompts = [
  'Status pesanan saya dengan nomor order #1234?',
  'Estimasi pengiriman same-day untuk area Jakarta Pusat?',
  'Bagaimana cara retur atau tukar produk yang rusak?',
  'Apakah ada promo atau voucher yang sedang aktif?',
  'Produk mille crepes rasa apa saja yang masih tersedia?',
]

export default function SupportChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hai! Saya asisten CS Salis. Ceritakan kebutuhanmu, saya bantu.' },
  ])
  const [input, setInput] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if ((!input.trim() && !imageDataUrl) || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim() || '(gambar tanpa teks)',
      images: imageDataUrl ? [imageDataUrl] : undefined,
    }
    setInput('')
    setImageDataUrl(null)

    let assistantIndex = 0
    setMessages((prev) => {
      assistantIndex = prev.length + 1
      return [...prev, userMessage, { role: 'assistant', content: '' }]
    })

    const history = [...messages, userMessage]
    const toOllamaMessages = history.map((m) => ({
      ...m,
      images: m.images?.map((img) => {
        const base64 = img.split(',').pop() || img
        return base64
      }),
    }))
    const controller = new AbortController()
    abortRef.current = controller
    setIsLoading(true)

    let buffer = ''
    try {
      await streamOllamaChat({
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...toOllamaMessages],
        signal: controller.signal,
        onToken: (chunk) => {
          buffer += chunk
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
        const detail = error instanceof Error ? error.message : 'Layanan CS sedang tidak tersedia.'
        const friendly = detail.includes('illegal base64')
          ? 'Server Ollama menolak format gambar. Pastikan model mendukung gambar atau kirim ulang.'
          : 'Maaf, ada kendala dari server Ollama.'
        buffer = buffer || friendly
        setMessages((prev) => {
          const next = [...prev]
          next[assistantIndex] = { role: 'assistant', content: buffer }
          return next
        })
      }
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
  }

  const handleSelectPrompt = (text: string) => {
    setInput(text)
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImageDataUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      <MetaHead title="Chat CS AI" description="Chat customer service Salis Shop via Ollama lokal" />
      <section className="space-y-6">
        <header className="flex flex-col gap-3 rounded-3xl border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)] dark:bg-[var(--bg-elevated)]/80">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--muted-foreground)]">AI Support</p>
              <h1 className="text-3xl font-semibold text-[var(--fg)]">Chat CS AI </h1>
             
            </div>
          </div>
        </header>

        <div className="grid gap-6">
          <div className="card flex min-h-[560px] flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-[var(--fg)]">Percakapan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setMessages([{ role: 'assistant', content: 'Halo! Saya siap bantu kebutuhanmu.' }])
                }
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--fg)]"
              >
                <RefreshCcw className="h-4 w-4" /> Reset
              </button>
            </div>

            <div
              ref={listRef}
              className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-[var(--border)] bg-white/70 p-4 dark:bg-[var(--bg-elevated)]/80"
            >
              {messages.map((message, index) => {
                const isAssistant = message.role === 'assistant'
                const baseClass = isAssistant
                  ? 'ml-0 mr-auto max-w-[78%] space-y-1 rounded-2xl border border-[var(--border)] bg-white p-4 text-sm text-[var(--fg)] shadow-sm dark:bg-[var(--bg-elevated)]/80'
                  : 'ml-auto mr-0 max-w-[78%] rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm text-white shadow-sm'

                return (
                  <div key={`${message.role}-${index}`} className={baseClass}>
                    <p
                      className="whitespace-pre-wrap leading-relaxed"
                      style={{ color: isAssistant ? 'var(--fg)' : '#ffffff' }}
                    >
                      {message.content || '...'}
                    </p>
                    {!!message.images?.length && (
                      <div className="mt-2 space-y-2">
                        {message.images.map((src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt={`Lampiran ${i + 1}`}
                            className="max-h-56 w-auto rounded-xl border border-[var(--border)] bg-white object-contain"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSelectPrompt(prompt)}
                    className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-xs text-[var(--fg)] shadow-sm transition hover:border-[var(--primary)] dark:bg-[var(--bg-elevated)]/80"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <div className="flex items-end gap-3">
                <textarea
                  rows={2}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Tulis pertanyaan kamu di sini..."
                  className="min-h-[72px] flex-1 resize-none rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--fg)] shadow-sm focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/80"
                />
                <div className="flex flex-col items-stretch gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--fg)] shadow-sm transition hover:border-[var(--primary)] dark:bg-[var(--bg-elevated)]/80">
                    <ImageIcon className="h-4 w-4" />
                    Lampirkan gambar
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                  {imageDataUrl && (
                    <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-xs text-[var(--fg)] shadow-sm dark:bg-[var(--bg-elevated)]/80">
                      <span className="truncate">1 gambar siap kirim</span>
                      <button
                        type="button"
                        onClick={() => setImageDataUrl(null)}
                        className="rounded-full p-1 text-[var(--muted-foreground)] transition hover:bg-[var(--muted)]/60"
                        aria-label="Hapus gambar"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={isLoading || (!input.trim() && !imageDataUrl)}
                    onClick={handleSend}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" /> Kirim
                  </button>
                  {isLoading && (
                    <button
                      type="button"
                      onClick={handleStop}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--muted-foreground)] shadow-sm transition hover:border-[var(--primary)] dark:bg-[var(--bg-elevated)]/80"
                    >
                      <StopCircle className="h-4 w-4" /> Hentikan
                    </button>
                  )}
                </div>
              </div>
              </div>
            </div>
        </div>
      </section>
    </>
  )
}
