import { Icon, type IconProps } from './Icon'

export default function ChevronUp(props: Omit<IconProps, 'name'>) {
  return <Icon name="chevron-up" {...props} />
}
