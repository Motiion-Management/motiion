import { Icon, type IconProps } from './Icon';

export default function MoreVertical(props: Omit<IconProps, 'name'>) {
  return <Icon name="ellipsis" {...props} />;
}
