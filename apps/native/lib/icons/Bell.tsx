import { Icon, type IconProps } from './Icon';

export default function Bell(props: Omit<IconProps, 'name'>) {
  return <Icon name="bell" {...props} />;
}
