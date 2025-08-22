import { router } from 'expo-router'
import React, { useState, useRef } from 'react'
import { View } from 'react-native'
import PagerView from 'react-native-pager-view'

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
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard'
import { BackgroundGradientView } from '~/components/ui/background-gradient-view'

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
  const [currentPage, setCurrentPage] = useState(0)
  const pagerRef = useRef<PagerView>(null)

  const handleFormComplete = async (formIndex: number) => {
    if (formIndex < WORK_DETAIL_FORMS.length - 1) {
      // Move to next form
      const nextPage = formIndex + 1
      setCurrentPage(nextPage)
      pagerRef.current?.setPage(nextPage)
    } else {
      // Last form completed, navigate to next group
      router.push('/app/onboarding-v2/experiences')
    }
  }

  return (
    <OnboardingStepGuard requiredStep="headshots">
      <BackgroundGradientView>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
          scrollEnabled={false} // Disable manual swiping, only programmatic navigation
        >
          {WORK_DETAIL_FORMS.map((form, index) => {
            const FormComponent = form.component
            return (
              <View key={form.key} style={{ flex: 1 }}>
                <FormComponent
                  mode="fullscreen"
                  onComplete={() => handleFormComplete(index)}
                  autoFocus={index === currentPage}
                />
              </View>
            )
          })}
        </PagerView>
      </BackgroundGradientView>
    </OnboardingStepGuard>
  )
}