import { Icon, type IconProps } from './Icon';

export default function Sparkles(props: Omit<IconProps, 'name'>) {
  return <Icon name="sparkles" size={24} {...props} />;
}
