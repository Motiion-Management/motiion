import { PressableRef } from '@rn-primitives/types';
import { type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, Pressable, PressableProps, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { Slot } from '~/components/primitives/slot';
import { TextClassContext } from '~/components/ui/text';
import { cn } from '~/lib/cn';
import { useColorScheme } from '~/lib/useColorScheme';
import { buttonVariants, androidRootVariants, buttonTextVariants } from './variants';

// Android ripple colors that adapt to color scheme
function getAndroidRipple(colorScheme: 'light' | 'dark', variant: ButtonVariant) {
  const baseColor = colorScheme === 'dark' ? '255, 255, 255' : '0, 0, 0';
  const opacity = variant === 'secondary' || variant === 'tertiary' ? 0.1 : 0.2;
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

/**
 * Button component with variants matching Figma design system.
 *
 * **Variants:**
 * - `primary` - Dark background, white text (Primary button)
 * - `secondary` - Tinted background with border (Secondary button)
 * - `tertiary` - Text-only, no background (Tertiary button)
 * - `accent` - Accent color background (FAB-Accent)
 *
 * **Sizes:**
 * - `sm`, `md`, `lg` - Standard button sizes
 * - `icon` - Square icon button (FAB)
 * - `iconInline` - Small inline icon button
 */
type ButtonProps = PressableProps & ButtonVariantProps & AndroidOnlyButtonProps;

const Root = Platform.OS === 'android' ? View : Slot;

const Button = React.forwardRef<PressableRef, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size,
      style = BORDER_CURVE,
      androidRootClassName,
      onPressIn,
      onPressOut,
      ...props
    },
    ref
  ) => {
    const { colorScheme } = useColorScheme();

    // iOS spring animation for press interaction
    // Smaller buttons need more pronounced scale for visibility
    const pressedScale = React.useMemo(() => {
      if (size === 'icon' || size === 'iconInline') return 0.88;
      if (size === 'sm') return 0.92;
      return 0.95;
    }, [size]);

    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = React.useCallback(
      (event: any) => {
        if (Platform.OS === 'ios' && !props.disabled) {
          // Slight bounce on press - less stiff, controlled overshoot
          scale.value = withSpring(pressedScale, {
            damping: 14,
            stiffness: 300,
            mass: 0.8,
          });
        }
        onPressIn?.(event);
      },
      [props.disabled, onPressIn, scale, pressedScale]
    );

    const handlePressOut = React.useCallback(
      (event: any) => {
        if (Platform.OS === 'ios') {
          // Gentle spring return with minimal bounce
          scale.value = withSpring(1, {
            damping: 20,
            stiffness: 300,
            mass: 0.8,
          });
        }
        onPressOut?.(event);
      },
      [onPressOut, scale]
    );

    const pressable = (
      <Pressable
        className={cn(
          buttonVariants({ variant, size, className }),
          props.disabled && 'bg-button-surface-disabled',
          props.disabled && variant === 'secondary' && 'border-border-disabled'
        )}
        ref={ref}
        style={style}
        android_ripple={props.disabled ? undefined : getAndroidRipple(colorScheme, variant)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      />
    );

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
          {Platform.OS === 'ios' ? (
            <Animated.View style={animatedStyle}>{pressable}</Animated.View>
          ) : (
            pressable
          )}
        </Root>
      </TextClassContext.Provider>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
