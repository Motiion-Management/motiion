import { IconProps, MaterialIconName } from '@roninoss/icons';
import { AlertButton, AlertType, KeyboardType, View } from 'react-native';

type AlertInputValue = { login: string; password: string } | string;

type AlertProps = {
  title: string;
  buttons: (Omit & { onPress?: (text: AlertInputValue) => void })[];
  message?: string | undefined;
  prompt?: {
    type?: Exclude | undefined;
    defaultValue?: string | undefined;
    keyboardType?: KeyboardType | undefined;
  };
  materialPortalHost?: string;
  materialIcon?: Pick & { name: MaterialIconName };
  materialWidth?: number;
  children?: React.ReactNode;
};

type AlertRef = React.ElementRef & {
  show: () => void;
  prompt: (args: AlertProps & { prompt: AlertProps['prompt'] }) => void;
  alert: (args: AlertProps) => void;
};

export type { AlertInputValue, AlertProps, AlertRef };
