import { type ClassValue, clsx } from 'clsx';
import { toDate, differenceInYears, endOfToday } from 'date-fns';
// Use native toast library in RN; avoid web-only 'sonner'
import { toast } from 'sonner-native';
import { extendTailwindMerge } from 'tailwind-merge';

import { customFontSizes } from '~/lib/theme/fontSizes';

type FontSizeOptions = keyof typeof customFontSizes;

const twMerge = extendTailwindMerge<FontSizeOptions>({
  extend: {
    classGroups: {
      'font-size': [{ text: Object.keys(customFontSizes) as FontSizeOptions[] }],
    },
  },
  // Add your custom tailwind config here
});
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatHeight(height?: { feet: number; inches: number }) {
  if (!height) return '';
  return `${height.feet}' ${height.inches}"`;
}

export const UNITS = {
  inches: `"`,
  feet: `'`,
} as const;

export function formatSizeValue(value: number, unit?: keyof typeof UNITS) {
  if (!value) return value;
  return `${value}${unit ? UNITS[unit] : ''}`;
}

export function locationToString(location?: {
  city: string;
  state: string;
  country: string;
  address?: string;
  zipCode?: string;
}) {
  if (!location) {
    return '';
  }
  return `${location.address} ${location.city}, ${location.state} ${location.zipCode}`.trim();
}

export function calculateAge(dateOfBirth?: string | null) {
  if (!dateOfBirth) {
    return;
  }
  const dob = toDate(dateOfBirth);
  return differenceInYears(endOfToday(), dob);
}

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

export async function shareLink(shareTitle: string, shareText: string, link: string) {
  try {
    // Prefer React Native Share API when available to avoid window/navigator usage
    // Dynamically import to keep this util portable
    const { Share } = await import('react-native');
    await Share.share({
      title: shareTitle,
      message: `${shareText} ${link}`.trim(),
      url: link,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to share link';
    toast.error(message);
    console.error(e);
  }
}

export function createShareLink(shareTitle: string, shareText: string, link: string) {
  return async () => await shareLink(shareTitle, shareText, link);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
