import { type ClassValue, clsx } from 'clsx'
import { toast } from 'sonner'
import { extendTailwindMerge } from 'tailwind-merge'
import { toDate, differenceInYears, endOfToday } from 'date-fns'

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

export function locationToString(location?: {
  city: string
  state: string
  country: string
  address?: string
  zipCode?: string
}) {
  if (!location) {
    return ''
  }
  return `${location.address} ${location.city}, ${location.state} ${location.zipCode}`.trim()
}

export function calculateAge(dateOfBirth?: string | null) {
  if (!dateOfBirth) {
    return
  }
  const dob = toDate(dateOfBirth)
  return differenceInYears(endOfToday(), dob)
}

export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined
}

export async function shareLink(
  shareTitle: string,
  shareText: string,
  link: string
) {
  const shareData = {
    title: shareTitle,
    text: shareText,
    url: new URL(
      link.includes('://') ? link : `${window.location.origin}${link}`
    ).toString()
  }

  console.log('shareData', shareData)
  try {
    if (navigator?.share && navigator.canShare(shareData)) {
      await navigator.share(shareData)
    } else {
      throw new Error('Web Share API not supported')
    }
  } catch (e: any) {
    toast.error(e.message || 'Failed to share link')
    console.error(e)
  }
}

export function createShareLink(
  shareTitle: string,
  shareText: string,
  link: string
) {
  return async () => await shareLink(shareTitle, shareText, link)
}
