import { Icon, type IconProps } from './Icon';

export default function CircleAlert(props: Omit<IconProps, 'name'>) {
  return <Icon name="exclamationmark.circle" {...props} />;
}
