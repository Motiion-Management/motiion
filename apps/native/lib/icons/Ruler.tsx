import { Icon, type IconProps } from './Icon';

export default function Ruler(props: Omit<IconProps, 'name'>) {
  return <Icon name="ruler" size={24} {...props} />;
}
