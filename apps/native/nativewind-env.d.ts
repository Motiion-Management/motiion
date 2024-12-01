/// <reference types="nativewind/types" />
import { SwitchProps as SwitchPropsBase } from 'react-native-web'
declare module 'react-native-web' {
  interface SwitchProps extends SwitchPropsBase {
    className?: string
  }
}
