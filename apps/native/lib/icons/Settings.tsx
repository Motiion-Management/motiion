import { Icon, type IconProps } from './Icon'

export default function Settings(props: Omit<IconProps, 'name'>) {
  return <Icon name="settings" {...props} />
}
