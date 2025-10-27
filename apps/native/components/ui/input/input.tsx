import { useAugmentedRef, useControllableState } from '@rn-primitives/hooks';
import * as React from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { ErrorText } from '~/components/ui/error-text';
import { HelperText, HelperTextProps } from '~/components/ui/helper-text';
import { InputLabel } from '~/components/ui/label';
import { cn } from '~/lib/cn';
import XCircle from '~/lib/icons/XCircle';
import { Button } from '~/components/ui/button';

type InputProps = TextInputProps & {
  children?: React.ReactNode;
  leftView?: React.ReactNode;
  rightView?: React.ReactNode;
  label?: string;
  labelClassName?: string;
  containerClassName?: string;
  invalid?: boolean;
  displayOnly?: boolean;
  /**
   * Helper text displayed below the input
   */
  helperTextProps?: HelperTextProps;
  /**
   * For accessibility, can be overridden by accessibilityHint
   * @Material - shows error state with destructive color and icon
   * @iOS - No visual change
   */
  errorMessage?: string;
  /**
   * @MaterialOnly
   * @default outlined
   * Material variant for the input.
   */
  materialVariant?: 'outlined' | 'filled';
  materialRingColor?: string;
  materialHideActionIcons?: boolean;
  /**
   * Border radius variant for dropdown compatibility
   * @default full - fully rounded corners
   * @dropdown-open - rounded top only for seamless dropdown connection
   */
  borderRadiusVariant?: 'full' | 'dropdown-open';
  /**
   * Content slot that appears directly below the input field
   * Useful for dropdowns, autocomplete results, etc.
   */
  bottomSlot?: React.ReactNode;
  /**
   * Controls when the clear button is shown
   * @default 'while-editing'
   */
  clearButtonMode?: 'never' | 'while-editing' | 'always';
  /**
   * Custom clear action called in addition to the default clear
   */
  onClear?: () => void;
};

type InputRef = TextInput;

const Input = React.forwardRef<InputRef, InputProps>(
  (
    {
      value: valueProp,
      onChangeText: onChangeTextProp,
      editable,
      readOnly,
      className,
      leftView,
      rightView,
      label,
      containerClassName,
      invalid,
      accessibilityHint,
      helperTextProps,
      errorMessage,
      borderRadiusVariant = 'full',
      bottomSlot,
      clearButtonMode = 'while-editing',
      onClear,
      onFocus: onFocusProp,
      onBlur: onBlurProp,
      ...props
    },
    ref
  ) => {
    const inputRef = useAugmentedRef({ ref, methods: { focus, blur, clear } });
    const [isFocused, setIsFocused] = React.useState(false);

    const [value = '', onChangeText] = useControllableState({
      prop: valueProp,
      defaultProp: valueProp ?? '',
      onChange: onChangeTextProp,
    });

    function focus() {
      inputRef.current?.focus();
    }

    function blur() {
      inputRef.current?.blur();
    }

    function clear() {
      onChangeText('');
    }

    const handleFocus = React.useCallback(
      (e: any) => {
        setIsFocused(true);
        onFocusProp?.(e);
      },
      [onFocusProp]
    );

    const handleBlur = React.useCallback(
      (e: any) => {
        setIsFocused(false);
        onBlurProp?.(e);
      },
      [onBlurProp]
    );

    const handleClear = React.useCallback(() => {
      clear(); // Always clear the input
      onClear?.(); // Also call custom onClear if provided
    }, [onClear]);

    // Determine if clear button should be shown
    const shouldShowClearButton =
      value && (clearButtonMode === 'always' || (clearButtonMode === 'while-editing' && isFocused));

    // Create the exact same clear button as in WorkLocationPicker
    const clearButton = shouldShowClearButton ? (
      <Button onPress={handleClear} size="iconInline" variant="primary">
        <XCircle className="text-text-high" />
      </Button>
    ) : undefined;

    // Combine rightView with clear button
    const combinedRightView = (
      <>
        {rightView}
        {clearButton}
      </>
    );

    const hasRightContent = rightView || clearButton;

    return (
      <View className={cn(editable === false && 'opacity-50', 'gap-2', containerClassName)}>
        {!!label && <InputLabel>{label}</InputLabel>}
        <Pressable
          disabled={editable === false || readOnly}
          onPress={focus}
          className="relative z-20">
          <View
            className={cn(
              'flex-row items-center border border-border-default bg-surface-tint px-6',
              borderRadiusVariant === 'full' ? 'rounded-full' : 'rounded-t-[29px]'
            )}>
            {!!leftView && leftView}
            <TextInput
              ref={inputRef}
              editable={editable}
              readOnly={readOnly}
              className={cn(
                'flex-1 bg-transparent py-3 text-[16px] text-text-default placeholder:text-text-default/40',
                readOnly && 'pointer-events-none',
                invalid && 'text-text-error',
                leftView && 'pl-2',
                hasRightContent && 'pr-2',
                className
              )}
              onChangeText={onChangeText}
              value={value}
              clearButtonMode="never"
              onFocus={handleFocus}
              onBlur={handleBlur}
              accessibilityHint={accessibilityHint ?? errorMessage}
              {...props}
            />
            {hasRightContent && combinedRightView}
          </View>
          {bottomSlot}
        </Pressable>
        {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
        {helperTextProps && <HelperText {...helperTextProps} />}
      </View>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps, InputRef };
