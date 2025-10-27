import { Icon, type IconProps } from './Icon';

export default function ArrowUpToLine(props: Omit<IconProps, 'name'>) {
  return <Icon name="arrow.up.to.line" size={20} {...props} />;
}
