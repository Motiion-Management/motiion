import { Icon, type IconProps } from './Icon';

export default function Filter(props: Omit<IconProps, 'name'>) {
  return <Icon name="filter" {...props} />;
}
