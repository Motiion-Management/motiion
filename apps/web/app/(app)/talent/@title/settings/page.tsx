import { Header } from '@/components/ui/header'
import { UserButton } from './user-button.client'

export default function SettingHeaderSlot() {
  return <Header title="Settings" actionSlot={<UserButton />} />
}
