import { Icon, type IconProps } from './Icon';

export default function X(props: Omit<IconProps, 'name'>) {
  return <Icon name="x" {...props} />;
}
