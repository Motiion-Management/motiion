import React from 'react'

import { TabScreenLayout } from '~/components/layouts/TabScreenLayout'
import {
  ProfileHeaderSettingsButton,
  ProfileHeaderTitle,
} from '~/components/profile/ProfileHeader'
import { ProfileContent } from './ProfileContent'

export default function ProfileScreen() {
  return (
    <TabScreenLayout
      header={{
        middle: ProfileHeaderTitle,
        right: ProfileHeaderSettingsButton,
      }}>
      <ProfileContent />
    </TabScreenLayout>
  )
}
