import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

import { customFontSizes } from './theme/fontSizes';

type FontSizeOptions = keyof typeof customFontSizes;

const twMerge = extendTailwindMerge<FontSizeOptions>({
  extend: {
    classGroups: {
      'font-size': [{ text: Object.keys(customFontSizes) as FontSizeOptions[] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
