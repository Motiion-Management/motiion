import { Icon, type IconProps } from './Icon'

export default function ChevronDown(props: Omit<IconProps, 'name'>) {
  return <Icon name="chevron-down" {...props} />
}
