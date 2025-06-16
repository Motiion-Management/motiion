import { useAugmentedRef, useControllableState } from '@rn-primitives/hooks';
import * as React from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { Text } from '~/components/ui/text';
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
  helperText?: string;
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
      helperText,
      errorMessage,
      materialVariant: _materialVariant,
      materialRingColor: _materialRingColor,
      materialHideActionIcons: _materialHideActionIcons,
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
        className={cn(editable === false && 'opacity-50 ', 'gap-4', containerClassName)}
        disabled={editable === false || readOnly}
        onPress={focus}>
        {!!label && (
          <View className={cn('mb-2')}>
            <Text variant="labelXs" className={cn('uppercase text-text-disabled', labelClassName)}>
              {label}
            </Text>
          </View>
        )}
        <View
          className={cn(
            'flex-row items-center rounded-full border border-border-default bg-surface-high px-4',
            errorMessage && 'bg-surface-error'
          )}>
          {!!leftView && leftView}
          <TextInput
            ref={inputRef}
            editable={editable}
            readOnly={readOnly}
            className={cn(
              'flex-1 bg-transparent py-4 text-[16px] text-text-default placeholder:text-text-default/40',
              errorMessage && 'text-text-error',
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
        {(helperText || errorMessage) && (
          <View className="mt-1 px-4">
            <Text
              variant="bodyXs"
              className={cn('text-text-disabled', errorMessage && 'text-text-error')}>
              {errorMessage || helperText}
            </Text>
          </View>
        )}
      </Pressable>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps, InputRef };
