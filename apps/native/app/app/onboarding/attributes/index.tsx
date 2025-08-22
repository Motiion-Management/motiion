import { router } from 'expo-router'
import React from 'react'
import { View } from 'react-native'

import { 
  DisplayNameForm, 
  HeightForm, 
  EthnicityForm, 
  HairColorForm, 
  EyeColorForm, 
  GenderForm 
} from '~/components/forms/onboarding'
import { OnboardingGroupPager } from '~/components/onboarding/OnboardingGroupPager'
import { GroupPageIndicator } from '~/components/onboarding/GroupPageIndicator'
import { SafeAreaView } from 'react-native-safe-area-context'

const ATTRIBUTE_FORMS = [
  { key: 'display-name', component: DisplayNameForm },
  { key: 'height', component: HeightForm },
  { key: 'ethnicity', component: EthnicityForm },
  { key: 'hair-color', component: HairColorForm },
  { key: 'eye-color', component: EyeColorForm },
  { key: 'gender', component: GenderForm },
]

export default function AttributesGroupScreen() {
  const [currentPage, setCurrentPage] = React.useState(0)

  const handleFormComplete = async (formIndex: number) => {
    if (formIndex < ATTRIBUTE_FORMS.length - 1) {
      // OnboardingGroupPager will handle auto-advance
      return
    } else {
      // Last form completed, navigate to next group
      router.push('/app/onboarding/work-details')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <View className="flex-1">
      <OnboardingGroupPager
        forms={ATTRIBUTE_FORMS}
        onFormComplete={handleFormComplete}
        onPageChange={handlePageChange}
        enableGestureNavigation={true}
        showGestureTutorial={true}
      />
      
      {/* Page indicator at bottom */}
      <SafeAreaView edges={['bottom']} className="absolute bottom-4 left-0 right-0">
        <GroupPageIndicator
          totalPages={ATTRIBUTE_FORMS.length}
          currentPage={currentPage}
          className="mb-4"
        />
      </SafeAreaView>
    </View>
  )
}