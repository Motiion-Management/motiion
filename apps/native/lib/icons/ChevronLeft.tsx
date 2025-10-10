import { Icon, type IconProps } from './Icon';

export default function ChevronLeft(props: Omit<IconProps, 'name'>) {
  return <Icon name="chevron.left" size={20} {...props} />;
}
