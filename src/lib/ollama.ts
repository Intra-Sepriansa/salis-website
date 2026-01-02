export type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
  images?: string[]
}

const normalizeBase = (value: string | undefined) => (value ? value.replace(/\/+$/, '') : '')

export const OLLAMA_BASE_URL = normalizeBase(import.meta.env.VITE_OLLAMA_BASE_URL) || 'http://localhost:11434'
export const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'llama3.1'

type StreamArgs = {
  messages: ChatMessage[]
  signal?: AbortSignal
  onToken: (chunk: string) => void
}

export async function streamOllamaChat({ messages, signal, onToken }: StreamArgs) {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: true,
      messages,
    }),
    signal,
  })

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => '')
    throw new Error(detail || `Ollama error: ${response.status} ${response.statusText}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    const lines = chunk.split('\n').filter(Boolean)

    for (const line of lines) {
      try {
        const payload = JSON.parse(line)
        const delta = payload?.message?.content ?? ''
        if (delta) onToken(delta)
        if (payload?.error) throw new Error(payload.error)
      } catch (error) {
        console.error('Failed to parse Ollama stream chunk', error)
      }
    }
  }
}
