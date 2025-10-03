import { SymbolView } from 'expo-symbols';
import { cssInterop } from 'nativewind';
import type { ComponentPropsWithoutRef } from 'react';
import type { ColorValue } from 'react-native';

// Register SymbolView with cssInterop to enable className support
// Maps className color utilities (e.g., text-icon-default) to tintColor prop
cssInterop(SymbolView, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      color: 'tintColor',
    },
  },
});

export interface IconProps {
  name: string; // Accept any SF Symbol name (e.g., 'bell', 'checkmark', 'chevron.down')
  size?: number;
  tintColor?: ColorValue;
  className?: string;
  strokeWidth?: number; // Accept but ignore for backward compatibility
}

// TODO: ANDROID - Add fallback for Android support
// When Android support is needed:
// 1. Import MaterialIcons from '@expo/vector-icons/MaterialIcons'
// 2. Configure cssInterop for MaterialIcons to map className → color prop:
//    cssInterop(MaterialIcons, {
//      className: {
//        target: 'style',
//        nativeStyleToProp: { color: true }
//      }
//    })
// 3. Add Platform.OS check to render MaterialIcons on Android
// 4. Create mapping from SF Symbol names to Material icon names
//    (or accept different icon names per platform via props)

export function Icon({ name, size = 24, tintColor, className, strokeWidth, ...props }: IconProps) {
  const SymbolViewAny = SymbolView as any;
  return <SymbolViewAny name={name} size={size} tintColor={tintColor} className={className} {...props} />;
}
