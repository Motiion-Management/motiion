import React, { useState } from 'react'
import { View } from 'react-native'

import { Button } from '~/components/ui/button'
import { Text } from '~/components/ui/text'

import { DisplayNameForm, HeightForm, EthnicityForm } from './index'

export function OnboardingFormTest() {
  const [activeForm, setActiveForm] = useState<string | null>(null)
  const [results, setResults] = useState<any>({})

  const handleFormComplete = (formName: string) => (data: any) => {
    console.log(`${formName} completed with data:`, data)
    setResults((prev: any) => ({ ...prev, [formName]: data }))
    setActiveForm(null)
  }

  const handleFormCancel = () => {
    setActiveForm(null)
  }

  if (activeForm === 'displayName') {
    return (
      <DisplayNameForm
        mode="fullscreen"
        onComplete={handleFormComplete('displayName')}
        onCancel={handleFormCancel}
      />
    )
  }

  if (activeForm === 'height') {
    return (
      <HeightForm
        mode="fullscreen"
        onComplete={handleFormComplete('height')}
        onCancel={handleFormCancel}
      />
    )
  }

  if (activeForm === 'ethnicity') {
    return (
      <EthnicityForm
        mode="fullscreen"
        onComplete={handleFormComplete('ethnicity')}
        onCancel={handleFormCancel}
      />
    )
  }

  return (
    <View className="flex-1 p-4 bg-white">
      <Text variant="title1" className="mb-6">Onboarding Form Test</Text>
      
      <View className="gap-4 mb-6">
        <Button onPress={() => setActiveForm('displayName')}>
          <Text>Test Display Name Form</Text>
        </Button>
        <Button onPress={() => setActiveForm('height')}>
          <Text>Test Height Form</Text>
        </Button>
        <Button onPress={() => setActiveForm('ethnicity')}>
          <Text>Test Ethnicity Form</Text>
        </Button>
      </View>

      <Text variant="title2" className="mb-4">Results:</Text>
      <Text className="text-sm">{JSON.stringify(results, null, 2)}</Text>
    </View>
  )
}