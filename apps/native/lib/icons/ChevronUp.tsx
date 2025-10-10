import { Icon, type IconProps } from './Icon';

export default function ChevronUp(props: Omit<IconProps, 'name'>) {
  return <Icon name="chevron.up" size={20} {...props} />;
}
