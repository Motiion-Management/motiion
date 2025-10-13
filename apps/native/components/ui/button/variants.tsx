import { cva } from 'class-variance-authority'

export const buttonVariants = cva('flex-row items-center justify-center gap-2', {
  variants: {
    variant: {
      primary: 'active:opacity-90 bg-button-surface-default',
      secondary: 'border border-border-tint bg-button-surface-tint active:bg-button-surface-tint',
      outline: 'border border-border-tint bg-transparent active:bg-button-surface-tint/40',
      tertiary: 'ios:active:opacity-70',
      accent: 'active:opacity-90 bg-button-surface-accent',
    },
    size: {
      none: '',
      sm: 'py-1 px-2.5 rounded-full',
      md: 'ios:rounded-full py-2 ios:py-1.5 ios:px-3.5 px-5 rounded-full',
      lg: 'py-2.5 px-5 ios:py-2 rounded-full gap-2',
      icon: 'ios:rounded-full h-12 w-12 rounded-full',
      iconInline: 'ios:rounded-full h-4 w-4 rounded-full',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

export const androidRootVariants = cva('overflow-hidden', {
  variants: {
    size: {
      none: '',
      icon: 'rounded-full',
      iconInline: 'rounded-full',
      sm: 'rounded-full',
      md: 'rounded-full',
      lg: 'rounded-full',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const buttonTextVariants = cva('font-semibold', {
  variants: {
    variant: {
      primary: 'text-text-high',
      secondary: 'text-text-default',
      tertiary: 'text-text-default',
      outline: 'text-text-default',
      accent: 'text-text-high',
    },
    size: {
      none: '',
      icon: 'text-[20px]',
      iconInline: 'text-[12px]',
      sm: 'text-[12px] leading-[16.8px]',
      md: 'text-[16px] leading-[22.4px]',
      lg: 'text-[16px] leading-[22.4px]',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})
