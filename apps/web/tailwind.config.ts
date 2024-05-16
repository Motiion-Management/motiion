import type { Config } from 'tailwindcss'

const pxToRem = (px: number | string, base: number = 16) => {
  const rem = (1 / base) * parseInt(`${px}`.replace('px', ''))

  return `${rem}rem`
}

export const customFontSizes = {
  // semantic
  h1: [
    pxToRem(40),
    {
      fontWeight: '600',
      letterSpacing: '-0.02em',
      lineHeight: '1.2'
    }
  ],
  h2: [
    pxToRem(32),
    {
      fontWeight: '600',
      letterSpacing: '-0.02em',
      lineHeight: '1.2'
    }
  ],
  h3: [
    pxToRem(24),
    {
      fontWeight: '600',
      letterSpacing: '-0.02em',
      lineHeight: '1.2'
    }
  ],
  h4: [
    pxToRem(18),
    {
      fontWeight: '600',
      letterSpacing: '-0.02em',
      lineHeight: '1.2'
    }
  ],
  h5: [
    pxToRem(16),
    {
      fontWeight: '600',
      letterSpacing: '-0.02em',
      lineHeight: '1.4'
    }
  ],
  h6: [
    pxToRem(12),
    {
      fontWeight: '600',
      letterSpacing: '-0.02em',
      lineHeight: '1.4'
    }
  ],
  'body-lg': [
    pxToRem(18),
    {
      fontWeight: '400',
      letterSpacing: '-0.025em',
      lineHeight: '1.5'
    }
  ],
  body: [
    pxToRem(16),
    {
      fontWeight: '400',
      letterSpacing: '-0.025em',
      lineHeight: '1.5'
    }
  ],
  'body-sm': [
    pxToRem(14),
    {
      fontWeight: '400',
      letterSpacing: '-0.025em',
      lineHeight: '1.4'
    }
  ],
  'body-xs': [
    pxToRem(12),
    {
      fontWeight: '400',
      letterSpacing: '-0.025em',
      lineHeight: '1.4'
    }
  ],
  'link-lg': [
    pxToRem(18),
    {
      fontWeight: '700',
      letterSpacing: '-0.01em',
      lineHeight: '1.5'
    }
  ],
  link: [
    pxToRem(16),
    {
      fontWeight: '700',
      letterSpacing: '-0.01em',
      lineHeight: '1.5'
    }
  ],
  'link-sm': [
    pxToRem(14),
    {
      fontWeight: '700',
      letterSpacing: '-0.01em',
      lineHeight: '1.2'
    }
  ],
  data1: [
    pxToRem(48),
    {
      fontWeight: '500',
      letterSpacing: '-0.04em',
      lineHeight: '1.2'
    }
  ],
  data2: [
    pxToRem(24),
    {
      fontWeight: '500',
      letterSpacing: '-0.02em',
      lineHeight: '1.2'
    }
  ],
  data3: [
    pxToRem(18),
    {
      fontWeight: '500',
      letterSpacing: '-0.02em',
      lineHeight: '1.2'
    }
  ],
  data4: [
    pxToRem(10),
    {
      fontWeight: '500',
      letterSpacing: '0.06em',
      lineHeight: '1.2'
    }
  ],

  // scale
  '2xs': pxToRem(10),
  xs: pxToRem(12),
  sm: pxToRem(14),
  base: pxToRem(16),
  lg: pxToRem(18),
  xl: pxToRem(24),
  '2xl': pxToRem(32),
  '3xl': pxToRem(40),
  '4xl': pxToRem(48)
} as const

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  prefix: '',
  theme: {
    extend: {
      container: {
        center: true,
        padding: '2rem',
        screens: {
          '2xl': '1400px'
        }
      },
      lineHeight: {
        normal: '1.5',
        snug: '1.4',
        tight: '1.2'
      },
      letterSpacing: {
        'very-tight': '-0.04em',
        tight: '-0.025em',
        normal: '-0.02em',
        loose: '-0.01em',
        'very-loose': '0.06em'
      },
      fontSize: customFontSizes,
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
        border: 'hsl(var(--border))',
        input: {
          DEFAULT: 'hsl(var(--input))', // border
          background: 'hsl(var(--input-background))',
          foreground: 'hsl(var(--input-foreground))'
        },
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      },
      screens: {
        touch: { raw: '(hover: none)' },
        'no-touch': { raw: '(hover: hover)' }
      },
      gridTemplateColumns: {
        'user-screen': 'minmax(0, 1fr)'
      },
      gridTemplateRows: {
        'user-screen': 'max-content minmax(0, 1fr) max-content',
        'user-screen-md': 'max-content max-content minmax(0, 1fr)'
      },
      gridTemplateAreas: {
        'user-screen': ['title', 'content', 'nav'],
        'user-screen-md': ['nav', 'title', 'content']
      }
    }
  },
  plugins: [
    // require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
    require('@savvywombat/tailwindcss-grid-areas')
  ]
} as const

export default config
