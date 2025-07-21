import { useAugmentedRef, useControllableState } from '@rn-primitives/hooks';
import * as React from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { ErrorText } from '~/components/ui/error-text';
import { HelperText, HelperTextProps } from '~/components/ui/helper-text';
import { InputLabel } from '~/components/ui/label';
import { cn } from '~/lib/cn';

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
      children,
      leftView,
      rightView,
      label,
      labelClassName,
      containerClassName,
      invalid,
      accessibilityHint,
      helperTextProps,
      errorMessage,
      materialVariant: _materialVariant,
      materialRingColor: _materialRingColor,
      materialHideActionIcons: _materialHideActionIcons,
      borderRadiusVariant = 'full',
      bottomSlot,
      ...props
    },
    ref
  ) => {
    const inputRef = useAugmentedRef({ ref, methods: { focus, blur, clear } });

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

    return (
      <Pressable
        className={cn(editable === false && 'opacity-50', 'gap-4', containerClassName)}
        disabled={editable === false || readOnly}
        onPress={focus}>
        {!!label && <InputLabel>{label}</InputLabel>}
        <View className="relative">
          <View
            className={cn(
              'flex-row items-center border border-border-default bg-surface-high px-6',
              borderRadiusVariant === 'full' ? 'rounded-full' : 'rounded-t-[29px]'
            )}>
            {!!leftView && leftView}
            <TextInput
              ref={inputRef}
              editable={editable}
              readOnly={readOnly}
              className={cn(
                'flex-1 bg-transparent py-3 text-[16px] text-text-default placeholder:text-text-default/40',
                invalid && 'text-text-error',
                leftView && 'pl-2',
                rightView && 'pr-2',
                className
              )}
              onChangeText={onChangeText}
              value={value}
              clearButtonMode="while-editing"
              accessibilityHint={accessibilityHint ?? errorMessage}
              {...props}
            />
            {rightView}
          </View>
          {bottomSlot}
        </View>
        {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
        {helperTextProps && <HelperText {...helperTextProps} />}
      </Pressable>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps, InputRef };
