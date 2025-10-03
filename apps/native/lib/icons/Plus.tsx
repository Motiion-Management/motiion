import { Icon, type IconProps } from './Icon';

export default function Plus(props: Omit<IconProps, 'name'>) {
  return <Icon name="plus" {...props} />;
}
