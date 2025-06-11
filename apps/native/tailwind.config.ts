import { customFontSizes } from './lib/theme/fontSizes';

const { hairlineWidth, platformSelect } = require('nativewind/theme');

module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      darkMode: 'class',
      letterSpacing: {
        'very-tight': '-0.04em',
        tight: '-0.025em',
        normal: '-0.02em',
        loose: '-0.01em',
        'very-loose': '0.06em',
      },
      fontSize: {
        ...JSON.parse(JSON.stringify(customFontSizes)),
        // Add Figma typography scale
        'heading-1': ['40px', { lineHeight: '1.2', fontWeight: '600' }],
        'heading-2': ['32px', { lineHeight: '1.2', fontWeight: '600' }],
        'heading-3': ['24px', { lineHeight: '1.2', fontWeight: '600' }],
        'heading-4': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-5': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-6': ['12px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-large': ['18px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-medium': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        border: withOpacity('border'),
        input: withOpacity('input'),
        ring: withOpacity('ring'),
        background: withOpacity('background'),
        foreground: withOpacity('foreground'),
        
        primary: {
          DEFAULT: withOpacity('primary'),
          foreground: withOpacity('primary-foreground'),
        },
        secondary: {
          DEFAULT: withOpacity('secondary'),
          foreground: withOpacity('secondary-foreground'),
        },
        tonal: {
          DEFAULT: withOpacity('tonal'),
          foreground: withOpacity('tonal-foreground'),
        },
        destructive: {
          DEFAULT: withOpacity('destructive'),
          foreground: withOpacity('destructive-foreground'),
        },
        muted: {
          DEFAULT: withOpacity('muted'),
          foreground: withOpacity('muted-foreground'),
        },
        accent: {
          DEFAULT: withOpacity('accent'),
          foreground: withOpacity('accent-foreground'),
        },
        popover: {
          DEFAULT: withOpacity('popover'),
          foreground: withOpacity('popover-foreground'),
        },
        card: {
          DEFAULT: withOpacity('card'),
          foreground: withOpacity('card-foreground'),
        },
        
        // Button surface tokens
        'button-surface': {
          DEFAULT: withOpacity('button-surface-default'),
          high: withOpacity('button-surface-high'),
          accent: withOpacity('button-surface-accent'),
          disabled: withOpacity('button-surface-disabled'),
        },
        
        // Icon tokens
        icon: {
          DEFAULT: withOpacity('icon-default'),
          accent: withOpacity('icon-accent'),
          disabled: withOpacity('icon-disabled'),
        },
        
        // Text variants
        'text-low': withOpacity('text-low'),
        'text-accent-low': withOpacity('text-accent-low'),
        
        // State colors
        error: {
          surface: withOpacity('error-surface'),
          emphasis: withOpacity('error-emphasis'),
        },
        caution: {
          surface: withOpacity('caution-surface'),
          emphasis: withOpacity('caution-emphasis'),
        },
        
        // Direct Figma color values for utility use
        'primary-0': 'rgb(244 255 254)', /* #f4fffe */
        'primary-50': 'rgb(221 250 247)', /* #ddfaf7 */
        'primary-100': 'rgb(196 245 240)', /* #c4f5f0 */
        'primary-500': 'rgb(0 204 183)', /* #00ccb7 */
        'primary-850': 'rgb(0 61 55)', /* #003d37 */
        'primary-900': 'rgb(0 41 37)', /* #002925 */
        
        'utility-0': 'rgb(255 255 255)', /* #ffffff */
        'utility-50': 'rgb(250 250 250)', /* #fafafa */
        'utility-60': 'rgb(248 249 250)', /* #f8f9fa */
        'utility-200': 'rgb(135 143 155)', /* #878f9b */
        'utility-300': 'rgb(83 88 96)', /* #535860 */
        'utility-500': 'rgb(21 25 28)', /* #15191c */
        
        'error-500': 'rgb(204 1 36)', /* #cc0124 */
        'caution-500': 'rgb(245 142 49)', /* #f58e31 */
        'success-500': 'rgb(100 173 40)', /* #64ad28 */
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },
  plugins: [],
};

// Simplified function - same RGB approach for all platforms
function withOpacity(variableName: string) {
  return ({ opacityValue }: { opacityValue?: number }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(--${variableName}) / ${opacityValue})`;
    }
    return `rgb(var(--${variableName}))`;
  };
}
