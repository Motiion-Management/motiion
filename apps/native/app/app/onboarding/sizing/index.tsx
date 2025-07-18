import React, { useRef, useState } from 'react'
import { View, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { toast } from 'sonner-native'

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen'
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard'
import { Text } from '~/components/ui/text'
import { useOnboardingNavigation, useOnboardingStatus } from '~/hooks/useOnboardingStatus'
import { useSizingForm } from '~/hooks/useSizingForm'
import { SizingCard } from '~/components/sizing/SizingCard'
import { SizingPickerSheet, SizingPickerSheetRef } from '~/components/sizing/SizingPickerSheet'
import { sizingMetrics } from '~/config/sizingMetrics'
import { SizingMetricConfig } from '~/types/sizing'

export default function SizingScreen() {
  const router = useRouter()
  const { getStepTitle } = useOnboardingStatus()
  const { advanceToNextStep } = useOnboardingNavigation()
  const sizingForm = useSizingForm()
  const pickerRef = useRef<SizingPickerSheetRef>(null)
  const [currentMetricKey, setCurrentMetricKey] = useState<string | null>(null)

  const handleContinue = async () => {
    try {
      // Navigate to the next step - all fields are optional
      const result = await advanceToNextStep()
      if (result.route) {
        router.push(result.route)
      } else {
        // If no next step, onboarding is complete
        router.push('/app/home')
      }
    } catch (error) {
      console.error('Error in sizing step:', error)
      toast.error('An error occurred. Please try again.')
    }
  }

  const handleCardPress = (metricKey: string) => {
    const metric = sizingMetrics[metricKey]
    if (metric && pickerRef.current) {
      setCurrentMetricKey(metricKey)
      const currentValue = sizingForm.actions.getMetricValue(metric.section, metric.field)
      pickerRef.current.present(metric, currentValue)
    }
  }

  const handleSaveMetric = async (value: string) => {
    if (!currentMetricKey) return
    
    const metric = sizingMetrics[currentMetricKey]
    if (metric) {
      const success = await sizingForm.actions.updateMetric(
        metric.section,
        metric.field,
        value
      )
      
      if (!success) {
        toast.error('Failed to save. Please try again.')
      }
    }
  }

  const renderSection = (title: string, metrics: string[]) => (
    <View className="mb-6">
      <Text variant="body" className="mb-3 text-text-secondary uppercase">
        {title}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {metrics.map((metricKey) => {
          const metric = sizingMetrics[metricKey]
          if (!metric) return null
          
          const value = sizingForm.actions.getMetricValue(metric.section, metric.field)
          
          return (
            <SizingCard
              key={metricKey}
              label={metric.label}
              value={value}
              unit={metric.unit}
              onPress={() => handleCardPress(metricKey)}
            />
          )
        })}
      </View>
    </View>
  )

  return (
    <OnboardingStepGuard requiredStep="sizing">
      <BaseOnboardingScreen
        title="Size Card"
        description="Optional - Not all sizing metrics may apply to you. Only input what is relevant to you."
        canProgress={true} // Always true - all fields are optional
        primaryAction={{
          onPress: handleContinue,
        }}
      >
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {renderSection('General', ['waist', 'inseam', 'glove', 'hat'])}
          {renderSection('Men', ['chest', 'neck', 'sleeve', 'maleShirt', 'maleShoes', 'maleCoatLength'])}
          {renderSection('Women', ['dress', 'bust', 'underbust', 'cup', 'hip', 'femaleShirt', 'pants', 'femaleShoes', 'femaleCoatLength'])}
        </ScrollView>

        <SizingPickerSheet
          ref={pickerRef}
          onSave={handleSaveMetric}
        />
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  )
}
