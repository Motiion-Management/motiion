import { Icon as RoninIcon, type IconProps as RoninIconProps } from '@roninoss/icons'
import { Platform } from 'react-native'
import type { ComponentPropsWithoutRef } from 'react'

export type IconName =
  | 'bell'
  | 'calendar'
  | 'check'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-up'
  | 'circle-alert'
  | 'filter'
  | 'image'
  | 'more-vertical'
  | 'plus'
  | 'search'
  | 'settings'
  | 'x'
  | 'x-circle'

type IconMapping = {
  sfSymbol: string
  material: string
}

const ICON_MAP: Record<IconName, IconMapping> = {
  bell: { sfSymbol: 'bell', material: 'notifications' },
  calendar: { sfSymbol: 'calendar', material: 'event' },
  check: { sfSymbol: 'checkmark', material: 'check' },
  'chevron-down': { sfSymbol: 'chevron.down', material: 'keyboard-arrow-down' },
  'chevron-left': { sfSymbol: 'chevron.left', material: 'keyboard-arrow-left' },
  'chevron-right': { sfSymbol: 'chevron.right', material: 'keyboard-arrow-right' },
  'chevron-up': { sfSymbol: 'chevron.up', material: 'keyboard-arrow-up' },
  'circle-alert': { sfSymbol: 'exclamationmark.circle', material: 'error' },
  filter: { sfSymbol: 'line.3.horizontal.decrease', material: 'filter-list' },
  image: { sfSymbol: 'photo', material: 'image' },
  'more-vertical': { sfSymbol: 'ellipsis.vertical', material: 'more-vert' },
  plus: { sfSymbol: 'plus', material: 'add' },
  search: { sfSymbol: 'magnifyingglass', material: 'search' },
  settings: { sfSymbol: 'gearshape', material: 'settings' },
  x: { sfSymbol: 'xmark', material: 'close' },
  'x-circle': { sfSymbol: 'xmark.circle', material: 'cancel' }
}

export interface IconProps extends Omit<ComponentPropsWithoutRef<typeof RoninIcon>, 'name' | 'namingScheme'> {
  name: IconName
  size?: number
  color?: string
  className?: string
  strokeWidth?: number // Accept but ignore for backward compatibility with Lucide
}

export function Icon({ name, size = 24, color, className, strokeWidth }: IconProps) {
  const mapping = ICON_MAP[name]

  if (Platform.OS === 'ios') {
    const RoninIconAny = RoninIcon as any
    return (
      <RoninIconAny
        namingScheme="sfSymbol"
        name={mapping.sfSymbol}
        size={size}
        color={color}
        className={className}
      />
    )
  }

  const RoninIconAny = RoninIcon as any
  return (
    <RoninIconAny
      name={mapping.material}
      size={size}
      color={color}
      className={className}
    />
  )
}
