import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, Pressable, PressableProps, View, ViewStyle } from 'react-native';

import { TextClassContext } from '~/components/nativewindui/Text';
import { Slot } from '~/components/primitives/slot';
import { cn } from '~/lib/cn';
import { useColorScheme } from '~/lib/useColorScheme';
import { COLORS } from '~/theme/colors';

const buttonVariants = cva('flex-row items-center justify-center gap-2', {
  variants: {
    variant: {
      primary: 'active:opacity-90 bg-primary',
      outline: 'border border-border bg-card active:bg-muted',
      secondary:
        'ios:bg-background/10 dark:ios:bg-background/40 ios:active:bg-background/50 bg-primary/15 dark:bg-primary/30',
      accent: 'active:opacity-90 bg-accent',
      tonal: 'active:opacity-80 bg-tonal',
      plain: 'ios:active:opacity-70',
    },
    size: {
      none: '',
      sm: 'py-1 px-2.5 rounded-full',
      md: 'ios:rounded-full py-2 ios:py-1.5 ios:px-3.5 px-5 rounded-full',
      lg: 'py-2.5 px-5 ios:py-2 rounded-full gap-2',
      icon: 'ios:rounded-full h-12 w-12 rounded-full',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

const androidRootVariants = cva('overflow-hidden', {
  variants: {
    size: {
      none: '',
      icon: 'rounded-full',
      sm: 'rounded-full',
      md: 'rounded-full',
      lg: 'rounded-full',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const buttonTextVariants = cva('font-semibold text-link', {
  variants: {
    variant: {
      primary: 'text-primary-foreground',
      secondary: 'ios:text-primary text-foreground',
      outline: 'text-foreground',
      accent: 'text-accent-foreground',
      tonal: 'text-tonal-foreground',
      plain: 'text-foreground',
    },
    size: {
      none: '',
      icon: 'text-[20px]',
      sm: 'text-[15px] leading-5',
      md: 'text-[17px] leading-7',
      lg: 'text-[17px] leading-7',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

function convertToRGBA(rgb: string, opacity: number): string {
  const rgbValues = rgb.match(/\d+/g);
  if (!rgbValues || rgbValues.length !== 3) {
    throw new Error('Invalid RGB color format');
  }
  const red = parseInt(rgbValues[0], 10);
  const green = parseInt(rgbValues[1], 10);
  const blue = parseInt(rgbValues[2], 10);
  if (opacity < 0 || opacity > 1) {
    throw new Error('Opacity must be a number between 0 and 1');
  }
  return `rgba(${red},${green},${blue},${opacity})`;
}

const ANDROID_RIPPLE = {
  dark: {
    primary: { color: convertToRGBA(COLORS.dark.grey3, 0.4), borderless: false },
    outline: { color: convertToRGBA(COLORS.dark.grey5, 0.8), borderless: false },
    secondary: { color: convertToRGBA(COLORS.dark.grey5, 0.8), borderless: false },
    accent: { color: convertToRGBA(COLORS.dark.grey3, 0.4), borderless: false },
    plain: { color: convertToRGBA(COLORS.dark.grey5, 0.8), borderless: false },
    tonal: { color: convertToRGBA(COLORS.dark.grey5, 0.8), borderless: false },
  },
  light: {
    primary: { color: convertToRGBA(COLORS.light.grey4, 0.4), borderless: false },
    outline: { color: convertToRGBA(COLORS.light.grey4, 0.4), borderless: false },
    secondary: { color: convertToRGBA(COLORS.light.grey5, 0.4), borderless: false },
    accent: { color: convertToRGBA(COLORS.light.grey4, 0.4), borderless: false },
    plain: { color: convertToRGBA(COLORS.light.grey5, 0.4), borderless: false },
    tonal: { color: convertToRGBA(COLORS.light.grey6, 0.4), borderless: false },
  },
};

// Add as class when possible: https://github.com/marklawlor/nativewind/issues/522
const BORDER_CURVE: ViewStyle = {
  borderCurve: 'continuous',
};

type ButtonVariant = 'primary' | 'outline' | 'secondary' | 'accent' | 'tonal' | 'plain';

type ButtonVariantProps = Omit<VariantProps<typeof buttonVariants>, 'variant'> & {
  variant?: ButtonVariant;
};

type AndroidOnlyButtonProps = {
  /**
   * ANDROID ONLY: The class name of root responsible for hidding the ripple overflow.
   */
  androidRootClassName?: string;
};

type ButtonProps = PressableProps & ButtonVariantProps & AndroidOnlyButtonProps;

const Root = Platform.OS === 'android' ? View : Slot;

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  (
    { className, variant = 'primary', size, style = BORDER_CURVE, androidRootClassName, ...props },
    ref
  ) => {
    const { colorScheme } = useColorScheme();

    return (
      <TextClassContext.Provider value={cn(
        buttonTextVariants({ variant, size }),
        props.disabled && 'text-muted-foreground'
      )}>
        <Root
          className={Platform.select({
            ios: undefined,
            default: androidRootVariants({
              size,
              className: androidRootClassName,
            }),
          })}>
          <Pressable
            className={cn(
              buttonVariants({ variant, size, className }),
              props.disabled && 'opacity-60 bg-muted'
            )}
            ref={ref}
            style={style}
            android_ripple={props.disabled ? undefined : ANDROID_RIPPLE[colorScheme][variant]}
            {...props}
          />
        </Root>
      </TextClassContext.Provider>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
