import type { Config } from 'tailwindcss'
import { customFontSizes } from './lib/theme/fontSizes'

const config: Config = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      letterSpacing: {
        'very-tight': '-0.04em',
        tight: '-0.025em',
        normal: '-0.02em',
        loose: '-0.01em',
        'very-loose': '0.06em'
      },
      fontSize: {
        ...JSON.parse(JSON.stringify(customFontSizes))
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700'
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif']
      },
      colors: {
        // Legacy token support (uses CSS variable aliases)
        border: withOpacity('border'),
        input: withOpacity('input'),
        ring: withOpacity('ring'),
        background: withOpacity('background'),
        foreground: withOpacity('foreground'),

        primary: {
          DEFAULT: withOpacity('primary'),
          foreground: withOpacity('primary-foreground')
        },
        secondary: {
          DEFAULT: withOpacity('secondary'),
          foreground: withOpacity('secondary-foreground')
        },
        tonal: {
          DEFAULT: withOpacity('tonal'),
          foreground: withOpacity('tonal-foreground')
        },
        destructive: {
          DEFAULT: withOpacity('destructive'),
          foreground: withOpacity('destructive-foreground')
        },
        muted: {
          DEFAULT: withOpacity('muted'),
          foreground: withOpacity('muted-foreground')
        },
        accent: {
          DEFAULT: withOpacity('accent'),
          foreground: withOpacity('accent-foreground')
        },
        popover: {
          DEFAULT: withOpacity('popover'),
          foreground: withOpacity('popover-foreground')
        },
        card: {
          DEFAULT: withOpacity('card'),
          foreground: withOpacity('card-foreground')
        },

        // Figma semantic tokens (new naming)
        // Background tokens
        'background-default': withOpacity('background-default'),
        'background-low': withOpacity('background-low'),
        'background-accent': withOpacity('background-accent'),
        'background-overlay': withOpacity('background-overlay'),
        'background-utility-dark': withOpacity('background-utility-dark'),
        'background-utility-light': withOpacity('background-utility-light'),
        'background-utility-accent': withOpacity('background-utility-accent'),

        // Surface tokens
        'surface-default': withOpacity('surface-default'),
        'surface-high': withOpacity('surface-high'),
        'surface-accent': withOpacity('surface-accent'),
        'surface-low': withOpacity('surface-low'),
        'surface-dark': withOpacity('surface-dark'),
        'surface-tint': withOpacity('surface-tint'),
        'surface-overlay': withOpacity('surface-overlay'),
        'surface-tint-accent': withOpacity('surface-tint-accent'),
        'surface-disabled': withOpacity('surface-disabled'),
        'surface-error': withOpacity('surface-error'),
        'surface-caution': withOpacity('surface-caution'),

        // Text tokens
        'text-default': withOpacity('text-default'),
        'text-high': withOpacity('text-high'),
        'text-low': withOpacity('text-low'),
        'text-text-accent': withOpacity('text-accent'),
        'text-text-accent-low': withOpacity('text-accent-low'),
        'text-disabled': withOpacity('text-disabled'),
        'text-error': withOpacity('text-error'),
        'text-utility-light': withOpacity('text-utility-light'),
        'text-utility-dark': withOpacity('text-utility-dark'),
        'text-error-emphasis': withOpacity('text-error-emphasis'),
        'text-caution-emphasis': withOpacity('text-caution-emphasis'),

        // Button surface tokens
        'button-surface': {
          DEFAULT: withOpacity('button-surface-default'),
          default: withOpacity('button-surface-default'),
          tint: withOpacity('button-surface-tint'),
          disabled: withOpacity('button-surface-disabled'),
          low: withOpacity('button-surface-low'),
          high: withOpacity('button-surface-high'),
          accent: withOpacity('button-surface-accent'),
          'accent-low': withOpacity('button-surface-accent-low'),
          'utility-dark': withOpacity('button-surface-utility-dark'),
          'utility-light': withOpacity('button-surface-utility-light')
        },

        // Icon tokens
        'icon-default': withOpacity('icon-default'),
        'icon-tint': withOpacity('icon-tint'),
        'icon-inverse': withOpacity('icon-inverse'),
        'icon-low': withOpacity('icon-low'),
        'icon-accent': withOpacity('icon-accent'),
        'icon-disabled': withOpacity('icon-disabled'),
        'icon-utility-dark': withOpacity('icon-utility-dark'),
        'icon-error': withOpacity('icon-error'),
        'icon-error-emphasis': withOpacity('icon-error-emphasis'),
        'icon-caution-emphasis': withOpacity('icon-caution-emphasis'),

        // Border tokens
        'border-default': withOpacity('border-default'),
        'border-low': withOpacity('border-low'),
        'border-high': withOpacity('border-high'),
        'border-accent': withOpacity('border-accent'),
        'border-disabled': withOpacity('border-disabled'),
        'border-tint': withOpacity('border-tint'),
        'border-inverse': withOpacity('border-inverse'),

        // Direct Figma color values for utility use
        'primary-0': 'rgb(244 255 254)' /* #f4fffe */,
        'primary-50': 'rgb(221 250 247)' /* #ddfaf7 */,
        'primary-100': 'rgb(196 245 240)' /* #c4f5f0 */,
        'primary-500': 'rgb(0 204 183)' /* #00ccb7 */,
        'primary-850': 'rgb(0 61 55)' /* #003d37 */,
        'primary-900': 'rgb(0 41 37)' /* #002925 */,

        'utility-0': 'rgb(255 255 255)' /* #ffffff */,
        'utility-50': 'rgb(250 250 250)' /* #fafafa */,
        'utility-60': 'rgb(248 249 250)' /* #f8f9fa */,
        'utility-200': 'rgb(135 143 155)' /* #878f9b */,
        'utility-300': 'rgb(83 88 96)' /* #535860 */,
        'utility-500': 'rgb(21 25 28)' /* #15191c */,

        'error-500': 'rgb(204 1 36)' /* #cc0124 */,
        'caution-500': 'rgb(245 142 49)' /* #f58e31 */,
        'success-500': 'rgb(100 173 40)' /* #64ad28 */
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: []
}

// Simplified function - same RGB approach for all platforms
function withOpacity(variableName: string): string {
  return `rgb(var(--${variableName}))`
}

export default config
