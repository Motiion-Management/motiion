import { Icon, type IconProps } from './Icon';

export default function Globe(props: Omit<IconProps, 'name'>) {
  return <Icon name="globe" size={24} {...props} />;
}
