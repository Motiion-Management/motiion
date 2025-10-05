import { SymbolView, SymbolViewProps } from 'expo-symbols';
import { cssInterop } from 'nativewind';

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

export interface IconProps extends SymbolViewProps {}

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

export function Icon({ size = 24, ...props }: IconProps) {
  return <SymbolView size={size} {...props} />;
}
