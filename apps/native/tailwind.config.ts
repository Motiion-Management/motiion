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
      fontSize: JSON.parse(JSON.stringify(customFontSizes)),
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

function withOpacity(variableName: string) {
  return ({ opacityValue }: { opacityValue: number }) => {
    if (opacityValue !== undefined) {
      return platformSelect({
        ios: `hsla(var(--${variableName}) / ${opacityValue})`,
        android: `rgb(var(--android-${variableName}) / ${opacityValue})`,
      });
    }
    return platformSelect({
      ios: `hsla(var(--${variableName}))`,
      android: `rgb(var(--android-${variableName}))`,
    });
  };
}
