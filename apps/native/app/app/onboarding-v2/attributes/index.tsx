import { router } from 'expo-router'
import React, { useState, useRef } from 'react'
import { View } from 'react-native'
import PagerView from 'react-native-pager-view'

import { 
  DisplayNameForm, 
  HeightForm, 
  EthnicityForm, 
  HairColorForm, 
  EyeColorForm, 
  GenderForm 
} from '~/components/forms/onboarding'
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard'
import { BackgroundGradientView } from '~/components/ui/background-gradient-view'

const ATTRIBUTE_FORMS = [
  { key: 'display-name', component: DisplayNameForm },
  { key: 'height', component: HeightForm },
  { key: 'ethnicity', component: EthnicityForm },
  { key: 'hair-color', component: HairColorForm },
  { key: 'eye-color', component: EyeColorForm },
  { key: 'gender', component: GenderForm },
]

export default function AttributesGroupScreen() {
  const [currentPage, setCurrentPage] = useState(0)
  const pagerRef = useRef<PagerView>(null)

  const handleFormComplete = async (formIndex: number) => {
    if (formIndex < ATTRIBUTE_FORMS.length - 1) {
      // Move to next form
      const nextPage = formIndex + 1
      setCurrentPage(nextPage)
      pagerRef.current?.setPage(nextPage)
    } else {
      // Last form completed, navigate to next group
      router.push('/app/onboarding-v2/work-details')
    }
  }

  return (
    <OnboardingStepGuard requiredStep="display-name">
      <BackgroundGradientView>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
          scrollEnabled={false} // Disable manual swiping, only programmatic navigation
        >
          {ATTRIBUTE_FORMS.map((form, index) => {
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