import { router } from 'expo-router'
import React from 'react'
import { View } from 'react-native'

import { 
  HeadshotsForm,
  SizingForm,
  LocationForm,
  WorkLocationForm,
  RepresentationForm,
  AgencyForm,
  TrainingForm,
  SkillsForm,
} from '~/components/forms/onboarding'
import { OnboardingGroupPager } from '~/components/onboarding/OnboardingGroupPager'
import { GroupPageIndicator } from '~/components/onboarding/GroupPageIndicator'
import { SafeAreaView } from 'react-native-safe-area-context'

const WORK_DETAIL_FORMS = [
  { key: 'headshots', component: HeadshotsForm },
  { key: 'sizing', component: SizingForm },
  { key: 'location', component: LocationForm },
  { key: 'work-location', component: WorkLocationForm },
  { key: 'representation', component: RepresentationForm },
  { key: 'agency', component: AgencyForm },
  { key: 'training', component: TrainingForm },
  { key: 'skills', component: SkillsForm },
]

export default function WorkDetailsGroupScreen() {
  const [currentPage, setCurrentPage] = React.useState(0)

  const handleFormComplete = async (formIndex: number) => {
    if (formIndex < WORK_DETAIL_FORMS.length - 1) {
      // OnboardingGroupPager will handle auto-advance
      return
    } else {
      // Last form completed, navigate to next group
      router.push('/app/onboarding/experiences')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <View className="flex-1">
        <OnboardingGroupPager
          forms={WORK_DETAIL_FORMS}
          onFormComplete={handleFormComplete}
          onPageChange={handlePageChange}
          enableGestureNavigation={true}
          showGestureTutorial={false}
        />
        
        {/* Page indicator at bottom */}
        <SafeAreaView edges={['bottom']} className="absolute bottom-4 left-0 right-0">
          <GroupPageIndicator
            totalPages={WORK_DETAIL_FORMS.length}
            currentPage={currentPage}
            className="mb-4"
          />
        </SafeAreaView>
    </View>
  )
}