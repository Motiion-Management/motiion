import { Icon, type IconProps } from './Icon';

export default function Calendar(props: Omit<IconProps, 'name'>) {
  return <Icon name="calendar" {...props} />;
}
