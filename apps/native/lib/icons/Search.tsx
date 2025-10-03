import { Icon, type IconProps } from './Icon';

export default function Search(props: Omit<IconProps, 'name'>) {
  return <Icon name="search" {...props} />;
}
