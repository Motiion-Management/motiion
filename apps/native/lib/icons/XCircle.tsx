import { Icon, type IconProps } from './Icon'

export default function XCircle(props: Omit<IconProps, 'name'>) {
  return <Icon name="x-circle" {...props} />
}
