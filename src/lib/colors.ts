export type ThemeToken =
  | '--primary'
  | '--primary-foreground'
  | '--accent'
  | '--accent-strong'
  | '--bg'
  | '--bg-elevated'
  | '--fg'
  | '--fg-muted'
  | '--fg-subtle'
  | '--muted'
  | '--muted-strong'
  | '--muted-foreground'
  | '--border'
  | '--ring'

export type ThemeMode = 'light' | 'dark'

type ColorRecord = Record<ThemeToken, string>

type Palette = { light: ColorRecord; dark: ColorRecord }

export const palette: Palette = {
  light: {
    '--primary': '#c2410c',
    '--primary-foreground': '#fff8f1',
    '--accent': '#fbe5d5',
    '--accent-strong': '#f0b27a',
    '--bg': '#f2f4f8',
    '--bg-elevated': '#ffffff',
    '--fg': '#121826',
    '--fg-muted': '#2d364a',
    '--fg-subtle': '#45516a',
    '--muted': '#d5deed',
    '--muted-strong': '#b1bed8',
    '--muted-foreground': '#3b485f',
    '--border': 'rgba(18, 24, 38, 0.18)',
    '--ring': 'rgba(194, 65, 12, 0.52)',
  },
  dark: {
    '--primary': '#f7a262',
    '--primary-foreground': '#1c1008',
    '--accent': '#1f2f48',
    '--accent-strong': '#ef8a45',
    '--bg': '#05070f',
    '--bg-elevated': '#101726',
    '--fg': '#f5f7ff',
    '--fg-muted': '#d4ddff',
    '--fg-subtle': '#aab4d6',
    '--muted': '#16213b',
    '--muted-strong': '#24365c',
    '--muted-foreground': '#c2cae6',
    '--border': 'rgba(197, 208, 235, 0.22)',
    '--ring': 'rgba(247, 162, 98, 0.6)',
  },
}

const tokenToKey = {
  '--primary': 'primary',
  '--primary-foreground': 'primaryForeground',
  '--accent': 'accent',
  '--accent-strong': 'accentStrong',
  '--bg': 'bg',
  '--bg-elevated': 'bgElevated',
  '--fg': 'fg',
  '--fg-muted': 'fgMuted',
  '--fg-subtle': 'fgSubtle',
  '--muted': 'muted',
  '--muted-strong': 'mutedStrong',
  '--muted-foreground': 'mutedForeground',
  '--border': 'border',
  '--ring': 'ring',
} as const

type ColorKeys = (typeof tokenToKey)[keyof typeof tokenToKey]

type ColorMap = Record<ColorKeys, string>

export const colors = Object.entries(tokenToKey).reduce<ColorMap>((acc, [token, key]) => {
  acc[key as ColorKeys] = 'var(' + token + ')'
  return acc
}, {} as ColorMap)

const VAR_REGEX = /var\((--[a-zA-Z0-9-]+)\)/

const expandHex = (hex: string) => {
  const normalized = hex.replace('#', '')
  if (normalized.length === 3) {
    return normalized
      .split('')
      .map((ch) => ch + ch)
      .join('')
  }
  return normalized
}

const hexToRgb = (hex: string) => {
  const expanded = expandHex(hex)
  const value = Number.parseInt(expanded, 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

const channelToLinear = (value: number) => {
  const channel = value / 255
  return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
}

const resolveVar = (value: string): string | null => {
  const match = value.match(VAR_REGEX)
  if (!match) return null
  const token = match[1] as ThemeToken
  return palette.light[token] ?? palette.dark[token] ?? null
}

const normalizeColor = (value: string): string => {
  if (value.startsWith('#')) return value
  const resolved = resolveVar(value)
  return resolved ?? '#ffffff'
}

export const relativeLuminance = (value: string) => {
  const [r, g, b] = hexToRgb(normalizeColor(value))
  const [lr, lg, lb] = [channelToLinear(r), channelToLinear(g), channelToLinear(b)]
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
}

export const contrastRatio = (foreground: string, background: string) => {
  const lum1 = relativeLuminance(foreground)
  const lum2 = relativeLuminance(background)
  const [light, dark] = lum1 > lum2 ? [lum1, lum2] : [lum2, lum1]
  return (light + 0.05) / (dark + 0.05)
}

type OnBgOptions = {
  dark?: string
  light?: string
  threshold?: number
}

export const onBg = (background: string, { dark = '#161b26', light = '#ffffff', threshold = 0.55 }: OnBgOptions = {}) => {
  const luminance = relativeLuminance(background)
  return luminance > threshold ? dark : light
}

export default colors
