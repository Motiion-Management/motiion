import type { IconProps, MaterialIconName } from '@roninoss/icons';
import type { KeyboardType } from 'react-native';

type AlertInputValue = { login: string; password: string } | string;

type AlertButtonLike = {
  text: string;
  onPress?: (value: AlertInputValue) => void;
  style?: 'default' | 'cancel' | 'destructive';
};

type AlertPrompt = {
  type?: 'plain-text' | 'secure-text' | 'login-password';
  defaultValue?: string;
  keyboardType?: KeyboardType;
};

type AlertProps = {
  title: string;
  buttons: AlertButtonLike[];
  message?: string;
  prompt?: AlertPrompt;
  materialPortalHost?: string;
  materialIcon?: IconProps<any> & { name: MaterialIconName };
  materialWidth?: number;
  children?: React.ReactNode;
};

type AlertRef = {
  show: () => void;
  prompt: (args: AlertProps & { prompt: NonNullable<AlertProps['prompt']> }) => void;
  alert: (args: AlertProps) => void;
};

export type { AlertInputValue, AlertProps, AlertRef };
