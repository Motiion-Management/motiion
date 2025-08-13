import * as React from 'react'
import { Pressable, View, type GestureResponderEvent } from 'react-native'
import * as Slot from '../slot'
import type {
  IndicatorProps,
  IndicatorRef,
  ItemProps,
  ItemRef,
  RootProps,
  RootRef
} from './types'

const RadioGroupContext = React.createContext<RootProps | null>(null)

const RootInner = React.forwardRef<RootRef, RootProps>(
  ({ asChild, value, onValueChange, disabled = false, ...viewProps }, ref) => {
    const Component = asChild ? Slot.View : View
    return (
      <RadioGroupContext.Provider
        value={{
          value,
          disabled,
          onValueChange
        }}
      >
        <Component ref={ref} role="radiogroup" {...viewProps} />
      </RadioGroupContext.Provider>
    )
  }
)
const Root = RootInner as any

Root.displayName = 'RootRadioGroup'

function useRadioGroupContext() {
  const context = React.useContext(RadioGroupContext)
  if (!context) {
    throw new Error(
      'RadioGroup compound components cannot be rendered outside the RadioGroup component'
    )
  }
  return context
}

interface RadioItemContext {
  itemValue: string | undefined
}

const RadioItemContext = React.createContext<RadioItemContext | null>(null)

const ItemInner = React.forwardRef<ItemRef, ItemProps>(
  (
    {
      asChild,
      value: itemValue,
      disabled: disabledProp = false,
      onPress: onPressProp,
      ...props
    },
    ref
  ) => {
    const { disabled, value, onValueChange } = useRadioGroupContext()

    function onPress(ev: GestureResponderEvent) {
      if (disabled || disabledProp) return
      onValueChange(itemValue)
      onPressProp?.(ev)
    }

    const Component = asChild ? Slot.Pressable : Pressable
    return (
      <RadioItemContext.Provider
        value={{
          itemValue: itemValue
        }}
      >
        <Component
          ref={ref as any}
          role="radio"
          onPress={onPress}
          aria-checked={value === itemValue}
          disabled={(disabled || disabledProp) ?? false}
          accessibilityState={{
            disabled: (disabled || disabledProp) ?? false,
            checked: value === itemValue
          }}
          {...props}
        />
      </RadioItemContext.Provider>
    )
  }
)
const Item = ItemInner as any

Item.displayName = 'ItemRadioGroup'

function useRadioItemContext() {
  const context = React.useContext(RadioItemContext)
  if (!context) {
    throw new Error(
      'RadioItem compound components cannot be rendered outside the RadioItem component'
    )
  }
  return context
}

const IndicatorInner = React.forwardRef<IndicatorRef, IndicatorProps>(
  ({ asChild, forceMount, ...props }, ref) => {
    const { value } = useRadioGroupContext()
    const { itemValue } = useRadioItemContext()

    if (!forceMount) {
      if (value !== itemValue) {
        return null
      }
    }
    const Component = asChild ? Slot.View : View
    return <Component ref={ref} role="presentation" {...props} />
  }
)
const Indicator = IndicatorInner as any

Indicator.displayName = 'IndicatorRadioGroup'

export { Indicator, Item, Root, useRadioGroupContext }
