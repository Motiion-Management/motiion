import { Icon, type IconProps } from './Icon';

export default function Briefcase(props: Omit<IconProps, 'name'>) {
  return <Icon name="briefcase" size={24} {...props} />;
}
