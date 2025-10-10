import { Icon, type IconProps } from './Icon';

export default function ChevronRight(props: Omit<IconProps, 'name'>) {
  return <Icon name="chevron.right" size={20} {...props} />;
}
