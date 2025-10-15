import { Icon, type IconProps } from './Icon';

export default function PhotoTv(props: Omit<IconProps, 'name'>) {
  return <Icon name="photo.tv" size={24} {...props} />;
}
