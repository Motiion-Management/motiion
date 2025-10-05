import { Icon, type IconProps } from './Icon';

export default function Filter(props: Omit<IconProps, 'name'>) {
  return <Icon name="line.horizontal.3.decrease.circle.fill" {...props} />;
}
