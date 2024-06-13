import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Header } from './header'
import UserIcon from '@/public/UserIcon.svg'
import HelpIcon from '@/public/Help.svg'
import LockIcon from '@/public/Lock.svg'
import { SettingsTabs } from './settings-tabs'
export default function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="bg-background flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
          <SettingsTabs
           links={[
            {
              href: '/settings/account',
              header: 'Account',
              subtext: 'Update your personal and account info',
              iconPath: UserIcon
            },
            {
              href: '/settings/support',
              header: 'Support',
              subtext: 'Contact us for any issues you may experience',
              iconPath: HelpIcon
            },
            {
              href: '/settings/privacy',
              header: 'Data & Privacy',
              subtext: 'Update your account information',
              iconPath: LockIcon
            }
          ]}
          />
          <div className="grid gap-6">
           
          </div>
        </div>
      </main>
    </div>
  )
}
