'use client'

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
import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { BreadcrumbEllipsis } from '@/components/ui/breadcrumb'

export default function Dashboard() {
  const user = useQuery(api.users.getMyUser)
  const onboardingStep = user?.onboardingStep


  console.log(onboardingStep)
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="bg-background flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="mx-auto  w-full max-w-6xl gap-2 flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Settings</h1>
          <BreadcrumbEllipsis />
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
          <Card>
            <CardContent>
              <div className="flex items-center justify-center divide-x-2 divide-solid py-10 ">
                <div className="pr-10">
                  <p>Your Points</p>
                  <p className="text-secondary text-3xl font-semibold">250</p>
                </div>
                <div className="pl-10">
                  <ul>
                    <li>Input your information</li>
                    <li>Add headshots</li>
                    <li>Build your resume</li>
                    <li>Attend an event</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          <SettingsTabs
            links={[
              {
                href: '/talent/account',
                header: 'Account',
                subtext: 'Update your personal and account info',
                iconPath: UserIcon
              },
              {
                href: '/talent/support',
                header: 'Support',
                subtext: 'Contact us for any issues you may experience',
                iconPath: HelpIcon
              },
              {
                href: '/talent/privacy',
                header: 'Data & Privacy',
                subtext: 'Update your account information',
                iconPath: LockIcon
              }
            ]}
          />
          <div className="grid gap-6"></div>
        </div>
      </main>
    </div>
  )
}
