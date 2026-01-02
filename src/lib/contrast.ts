import tinycolor from 'tinycolor2'

export const pickText = (bg: string, light = '#fff', dark = '#111') =>
  tinycolor.readability(bg, light) >= 4.5 ? light : dark

export const withAutoText = (bg: string) => ({ bg, fg: pickText(bg) })
