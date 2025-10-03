import { Icon, type IconProps } from './Icon';

export default function Image(props: Omit<IconProps, 'name'>) {
  return <Icon name="image" {...props} />;
}
