'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Card, CardContent } from '@/components/ui/card'

import UserIcon from '@/public/UserIcon.svg'
import HelpIcon from '@/public/Help.svg'
import LockIcon from '@/public/Lock.svg'
import { SettingsTabs } from './settings-tabs'
import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { BreadcrumbEllipsis } from '@/components/ui/breadcrumb'
import CheckIcon from '@/public/SettingsCheck.svg'
import NotCompleteIcon from '@/public/SettingsCheckNotComplete.svg'
import { ChevronRight } from 'lucide-react'
import { useClerk } from '@clerk/clerk-react'
export default function Dashboard() {
  const user = useQuery(api.users.getMyUser)
  const userResumes = user?.resume?.uploads
  const userHeadshots = user?.headshots
  const onboardingStep = user?.onboardingStep
  const { signOut } = useClerk()
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="bg-background flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="mx-auto  flex w-full max-w-6xl items-center justify-between gap-2">
          <h1 className="text-3xl font-semibold">Settings</h1>
          <Popover>
            <PopoverTrigger>
              <BreadcrumbEllipsis />
            </PopoverTrigger>
            <PopoverContent>
              <div className='flex justify-center'>
                <Button onClick={signOut}>Sign Out</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
          <Card>
            <CardContent>
              <div className="flex items-center justify-center divide-x-2 divide-solid py-10">
                <div className="pr-10">
                  <p>Your Points</p>
                  <p className="text-secondary text-3xl font-semibold">250</p>
                </div>
                <div className="pl-10">
                  <ul className="pb-5">
                    <li className="flex gap-1 pb-1">
                      <Image
                        width={20}
                        height={20}
                        alt={
                          onboardingStep >= 3
                            ? 'Completed Check Icon'
                            : 'Not Completed Check Icon'
                        }
                        src={onboardingStep >= 3 ? CheckIcon : NotCompleteIcon}
                      />
                      Input your information
                    </li>
                    <li className="flex gap-1 pb-1">
                      <Image
                        width={20}
                        height={20}
                        alt={
                          userHeadshots?.length > 0
                            ? 'Completed Check Icon'
                            : 'Not Completed Check Icon'
                        }
                        src={
                          userHeadshots?.length > 0
                            ? CheckIcon
                            : NotCompleteIcon
                        }
                      />
                      Add headshots
                    </li>
                    <li className="flex gap-1 pb-1">
                      <Image
                        width={20}
                        height={20}
                        alt={
                          userResumes?.length > 0
                            ? 'Completed Check Icon'
                            : 'Not Completed Check Icon'
                        }
                        src={
                          userResumes?.length > 0 ? CheckIcon : NotCompleteIcon
                        }
                      />
                      Build your resume
                    </li>
                    <li className="flex gap-1 pb-1">
                      <Image
                        width={20}
                        height={20}
                        alt="Check"
                        src={NotCompleteIcon}
                      />{' '}
                      Attend an event
                    </li>
                  </ul>
                  <a className="pointer flex font-semibold">
                    Manage Points
                    <ChevronRight />
                  </a>
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
