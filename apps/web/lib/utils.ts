import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

import { customFontSizes } from '../tailwind.config'

type FontSizeOptions = keyof typeof customFontSizes

const twMerge = extendTailwindMerge<FontSizeOptions>({
  extend: {
    classGroups: {
      'font-size': [{ text: Object.keys(customFontSizes) as FontSizeOptions[] }]
    }
  }
  // Add your custom tailwind config here
})
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatHeight(height?: { feet: number; inches: number }) {
  if (!height) return ''
  return `${height.feet}' ${height.inches}"`
}

export const UNITS = {
  inches: `"`,
  feet: `'`
} as const

export function formatSizeValue(value: number, unit?: keyof typeof UNITS) {
  if (!value) return value
  return `${value}${unit ? UNITS[unit] : ''}`
}
