import { Icon, type IconProps } from './Icon';

export default function Check(props: Omit<IconProps, 'name'>) {
  return <Icon name="checkmark" {...props} />;
}
