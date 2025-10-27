import { Icon, type IconProps } from './Icon';

export default function PersonCropSquare(props: Omit<IconProps, 'name'>) {
  return <Icon name="person.crop.square" size={24} {...props} />;
}
