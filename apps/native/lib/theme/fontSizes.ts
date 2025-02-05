const pxToRem = (px: string | number, base = 16) => {
  const rem = (1 / base) * parseInt(`${px}`.replace('px', ''), 10);

  return `${rem}rem`;
};
export const customFontSizes = {
  // semantic
  h1: [
    pxToRem(40),
    {
      fontWeight: '600',
      letterSpacing: '-0.02em',
      lineHeight: '1.2',
    },
  ],
  h2: [
    pxToRem(32),
    {
      fontWeight: '600',
      letterSpacing: '-0.02em',
      lineHeight: '1.2',
    },
  ],
  h3: [
    pxToRem(24),
    {
      fontWeight: '600',
      letterSpacing: '-0.02em',
      lineHeight: '1.2',
    },
  ],
  h4: [
    pxToRem(18),
    {
      fontWeight: '600',
      letterSpacing: '-0.02em',
      lineHeight: '1.2',
    },
  ],
  h5: [
    pxToRem(16),
    {
      fontWeight: '600',
      letterSpacing: '-0.02em',
      lineHeight: '1.4',
    },
  ],
  h6: [
    pxToRem(12),
    {
      fontWeight: '600',
      letterSpacing: '-0.02em',
      lineHeight: '1.4',
    },
  ],
  'body-lg': [
    pxToRem(18),
    {
      fontWeight: '400',
      letterSpacing: '-0.025em',
      lineHeight: '1.5',
    },
  ],
  body: [
    pxToRem(16),
    {
      fontWeight: '400',
      letterSpacing: '-0.025em',
      lineHeight: '1.5',
    },
  ],
  'body-sm': [
    pxToRem(14),
    {
      fontWeight: '400',
      letterSpacing: '-0.025em',
      lineHeight: '1.4',
    },
  ],
  'body-xs': [
    pxToRem(12),
    {
      fontWeight: '400',
      letterSpacing: '-0.025em',
      lineHeight: '1.4',
    },
  ],
  'link-lg': [
    pxToRem(18),
    {
      fontWeight: '700',
      letterSpacing: '-0.01em',
      lineHeight: '1.5',
    },
  ],
  link: [
    pxToRem(16),
    {
      fontWeight: '700',
      letterSpacing: '-0.01em',
      lineHeight: '1.5',
    },
  ],
  'link-sm': [
    pxToRem(14),
    {
      fontWeight: '700',
      letterSpacing: '-0.01em',
      lineHeight: '1.2',
    },
  ],
  'label-lg': [
    pxToRem(48),
    {
      fontWeight: '500',
      letterSpacing: '-0.04em',
      lineHeight: '1.2',
    },
  ],
  label: [
    pxToRem(24),
    {
      fontWeight: '500',
      letterSpacing: '-0.02em',
      lineHeight: '1.2',
    },
  ],
  'label-sm': [
    pxToRem(18),
    {
      fontWeight: '500',
      letterSpacing: '-0.02em',
      lineHeight: '1.2',
    },
  ],
  'label-xs': [
    pxToRem(10),
    {
      fontWeight: '500',
      letterSpacing: '0.06em',
      lineHeight: '1.2',
    },
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
  '4xl': pxToRem(48),
};
