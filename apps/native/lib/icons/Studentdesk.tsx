import { Icon, type IconProps } from './Icon';

export default function Studentdesk(props: Omit<IconProps, 'name'>) {
  return <Icon name="studentdesk" size={24} {...props} />;
}
