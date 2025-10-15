import { Icon, type IconProps } from './Icon';

export default function Rosette(props: Omit<IconProps, 'name'>) {
  return <Icon name="rosette" size={24} {...props} />;
}
