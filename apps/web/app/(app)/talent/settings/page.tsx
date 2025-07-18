'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'

import UserIcon from '@/public/UserIcon.svg'
import HelpIcon from '@/public/Help.svg'
import LockIcon from '@/public/Lock.svg'
import { SettingsTabs } from './settings-tabs'
import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import CheckIcon from '@/public/SettingsCheck.svg'
import NotCompleteIcon from '@/public/SettingsCheckNotComplete.svg'
import { FC } from 'react'

const PointEntry: FC<{ text: string; completed: boolean }> = ({
  text,
  completed
}) => {
  return (
    <li className="grid grid-cols-[auto_1fr] gap-1">
      <Image
        width={20}
        height={20}
        alt={completed ? 'Completed Check Icon' : 'Not Completed Check Icon'}
        src={completed ? CheckIcon : NotCompleteIcon}
      />
      {text}
    </li>
  )
}

const PointsList: FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ul className="text-body-xs">{children}</ul>
}

export default function Dashboard() {
  const user = useQuery(api.users.getMyUser)
  const userResumes = user?.resume?.uploads || []
  const userHeadshots = user?.headshots || []
  const onboardingStep = user?.onboardingStep

  return (
    <div className="grid w-full max-w-6xl grid-rows-[auto_1fr] gap-6">
      <Card className="py-10">
        <CardContent className="grid grid-cols-[1fr_2fr] items-center gap-4 divide-x-2 py-0">
          <div className="grid place-items-center">
            <p className="text-body-sm">Your Points</p>
            <p className="text-secondary text-3xl font-semibold">250</p>
          </div>
          <div className="grid place-items-center pl-4">
            <PointsList>
              <PointEntry
                text="Input your information"
                completed={onboardingStep === '0'}
              />
              <PointEntry
                text="Add headshots"
                completed={userHeadshots?.length > 0}
              />
              <PointEntry
                text="Build your resume"
                completed={userResumes?.length > 0}
              />

              <PointEntry
                text="Attend an event"
                completed={onboardingStep === '3'}
              />
            </PointsList>
          </div>
        </CardContent>
      </Card>
      <SettingsTabs
        links={[
          {
            href: '/talent/settings/account',
            header: 'Account Details',
            subtext: 'Update your personal and account info',
            iconPath: UserIcon
          },
          {
            href: '/talent/settings/support',
            header: 'Support',
            subtext: 'Contact us for any issues you may experience',
            iconPath: HelpIcon
          },
          {
            href: '/talent/settings/privacy',
            header: 'Data & Privacy',
            subtext: 'Update your account information',
            iconPath: LockIcon
          }
        ]}
      />
    </div>
  )
}
