import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, Pressable, PressableProps, View, ViewStyle } from 'react-native';

import { Slot } from '~/components/primitives/slot';
import { TextClassContext } from '~/components/ui/text';
import { cn } from '~/lib/cn';
import { useColorScheme } from '~/lib/useColorScheme';

const buttonVariants = cva('flex-row items-center justify-center gap-2', {
  variants: {
    variant: {
      primary: 'active:opacity-90 bg-button-surface-default',
      outline: 'border border-border-default bg-button-surface-high active:bg-button-surface-high',
      secondary: 'active:opacity-90 bg-button-surface-high',
      accent: 'active:opacity-90 bg-button-surface-accent',
      tonal: 'active:opacity-90 bg-button-surface-high',
      plain: 'ios:active:opacity-70',
      'utility-light': 'bg-button-surface-utility-light',
      'utility-dark': 'bg-button-surface-utility-dark',
      'plain-utility-light': 'ios:active:opacity-70',
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

const buttonTextVariants = cva('font-semibold', {
  variants: {
    variant: {
      primary: 'text-text-high',
      secondary: 'text-text-default',
      outline: 'text-text-default',
      accent: 'text-text-high',
      tonal: 'text-text-default',
      plain: 'text-accent',
      'utility-light': 'text-text-utility-dark',
      'utility-dark': 'text-text-utility-light',
      'plain-utility-light': 'text-text-utility-light',
    },
    size: {
      none: '',
      icon: 'text-[20px]',
      sm: 'text-[12px] leading-[16.8px]',
      md: 'text-[16px] leading-[22.4px]',
      lg: 'text-[16px] leading-[22.4px]',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

// Android ripple colors that adapt to color scheme
function getAndroidRipple(colorScheme: 'light' | 'dark', variant: ButtonVariant) {
  const baseColor = colorScheme === 'dark' ? '255, 255, 255' : '0, 0, 0';
  const opacity = variant === 'outline' || variant === 'plain' || variant === 'tonal' ? 0.1 : 0.2;
  return {
    color: `rgba(${baseColor}, ${opacity})`,
    borderless: false,
  };
}

// Add as class when possible: https://github.com/marklawlor/nativewind/issues/522
const BORDER_CURVE: ViewStyle = {
  borderCurve: 'continuous',
};

type ButtonVariantProps = VariantProps<typeof buttonVariants>;
type ButtonVariant = ButtonVariantProps['variant'];

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
      <TextClassContext.Provider
        value={cn(buttonTextVariants({ variant, size }), props.disabled && 'text-text-disabled')}>
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
              props.disabled && 'bg-button-surface-disabled opacity-60'
            )}
            ref={ref}
            style={style}
            android_ripple={props.disabled ? undefined : getAndroidRipple(colorScheme, variant)}
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
