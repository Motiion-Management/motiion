import React, { forwardRef } from 'react'
import { View } from 'react-native'

import { Text } from '~/components/ui/text'

import { BaseOnboardingForm } from './BaseOnboardingForm'
import { OnboardingFormProps, OnboardingFormRef } from './types'

// Placeholder form for Resume
export const ResumeForm = forwardRef<OnboardingFormRef, OnboardingFormProps<any>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen' }, ref) => {
    const handleSubmit = async () => {
      await onComplete({})
    }

    return (
      <BaseOnboardingForm
        ref={ref}
        title="Upload your resume"
        description="This will help us pre-fill your profile"
        canProgress={true}
        mode={mode}
        onCancel={onCancel}
        onSubmit={handleSubmit}>
        <View className="p-4 bg-gray-100 rounded-lg">
          <Text>Resume upload placeholder - will be implemented later</Text>
        </View>
      </BaseOnboardingForm>
    )
  }
)

// Placeholder form for Headshots
export const HeadshotsForm = forwardRef<OnboardingFormRef, OnboardingFormProps<any>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen' }, ref) => {
    const handleSubmit = async () => {
      await onComplete({})
    }

    return (
      <BaseOnboardingForm
        ref={ref}
        title="Upload your headshots"
        description="Add professional photos"
        canProgress={true}
        mode={mode}
        onCancel={onCancel}
        onSubmit={handleSubmit}>
        <View className="p-4 bg-gray-100 rounded-lg">
          <Text>Headshots upload placeholder - will be implemented later</Text>
        </View>
      </BaseOnboardingForm>
    )
  }
)

// Placeholder form for Sizing
export const SizingForm = forwardRef<OnboardingFormRef, OnboardingFormProps<any>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen' }, ref) => {
    const handleSubmit = async () => {
      await onComplete({})
    }

    return (
      <BaseOnboardingForm
        ref={ref}
        title="Add your sizing information"
        description="Help casting directors find the right fit"
        canProgress={true}
        mode={mode}
        onCancel={onCancel}
        onSubmit={handleSubmit}>
        <View className="p-4 bg-gray-100 rounded-lg">
          <Text>Sizing form placeholder - will be implemented later</Text>
        </View>
      </BaseOnboardingForm>
    )
  }
)

// Placeholder form for Location
export const LocationForm = forwardRef<OnboardingFormRef, OnboardingFormProps<any>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen' }, ref) => {
    const handleSubmit = async () => {
      await onComplete({})
    }

    return (
      <BaseOnboardingForm
        ref={ref}
        title="Where are you located?"
        description="Set your primary location"
        canProgress={true}
        mode={mode}
        onCancel={onCancel}
        onSubmit={handleSubmit}>
        <View className="p-4 bg-gray-100 rounded-lg">
          <Text>Location form placeholder - will be implemented later</Text>
        </View>
      </BaseOnboardingForm>
    )
  }
)

// Placeholder form for Work Location
export const WorkLocationForm = forwardRef<OnboardingFormRef, OnboardingFormProps<any>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen' }, ref) => {
    const handleSubmit = async () => {
      await onComplete({})
    }

    return (
      <BaseOnboardingForm
        ref={ref}
        title="Where can you work?"
        description="Select work locations"
        canProgress={true}
        mode={mode}
        onCancel={onCancel}
        onSubmit={handleSubmit}>
        <View className="p-4 bg-gray-100 rounded-lg">
          <Text>Work location form placeholder - will be implemented later</Text>
        </View>
      </BaseOnboardingForm>
    )
  }
)

// Placeholder form for Representation
export const RepresentationForm = forwardRef<OnboardingFormRef, OnboardingFormProps<any>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen' }, ref) => {
    const handleSubmit = async () => {
      await onComplete({})
    }

    return (
      <BaseOnboardingForm
        ref={ref}
        title="Representation status"
        description="Are you represented by an agency?"
        canProgress={true}
        mode={mode}
        onCancel={onCancel}
        onSubmit={handleSubmit}>
        <View className="p-4 bg-gray-100 rounded-lg">
          <Text>Representation form placeholder - will be implemented later</Text>
        </View>
      </BaseOnboardingForm>
    )
  }
)

// Placeholder form for Agency
export const AgencyForm = forwardRef<OnboardingFormRef, OnboardingFormProps<any>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen' }, ref) => {
    const handleSubmit = async () => {
      await onComplete({})
    }

    return (
      <BaseOnboardingForm
        ref={ref}
        title="Agency information"
        description="Tell us about your agency"
        canProgress={true}
        mode={mode}
        onCancel={onCancel}
        onSubmit={handleSubmit}>
        <View className="p-4 bg-gray-100 rounded-lg">
          <Text>Agency form placeholder - will be implemented later</Text>
        </View>
      </BaseOnboardingForm>
    )
  }
)

// Placeholder form for Training
export const TrainingForm = forwardRef<OnboardingFormRef, OnboardingFormProps<any>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen' }, ref) => {
    const handleSubmit = async () => {
      await onComplete({})
    }

    return (
      <BaseOnboardingForm
        ref={ref}
        title="Training & education"
        description="Add your training background"
        canProgress={true}
        mode={mode}
        onCancel={onCancel}
        onSubmit={handleSubmit}>
        <View className="p-4 bg-gray-100 rounded-lg">
          <Text>Training form placeholder - will be implemented later</Text>
        </View>
      </BaseOnboardingForm>
    )
  }
)

// Placeholder form for Skills
export const SkillsForm = forwardRef<OnboardingFormRef, OnboardingFormProps<any>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen' }, ref) => {
    const handleSubmit = async () => {
      await onComplete({})
    }

    return (
      <BaseOnboardingForm
        ref={ref}
        title="Skills & abilities"
        description="Add your special skills"
        canProgress={true}
        mode={mode}
        onCancel={onCancel}
        onSubmit={handleSubmit}>
        <View className="p-4 bg-gray-100 rounded-lg">
          <Text>Skills form placeholder - will be implemented later</Text>
        </View>
      </BaseOnboardingForm>
    )
  }
)

// Placeholder form for Experiences
export const ExperiencesForm = forwardRef<OnboardingFormRef, OnboardingFormProps<any>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen' }, ref) => {
    const handleSubmit = async () => {
      await onComplete({})
    }

    return (
      <BaseOnboardingForm
        ref={ref}
        title="Performance experience"
        description="Add your performance history"
        canProgress={true}
        mode={mode}
        onCancel={onCancel}
        onSubmit={handleSubmit}>
        <View className="p-4 bg-gray-100 rounded-lg">
          <Text>Experiences form placeholder - will be implemented later</Text>
        </View>
      </BaseOnboardingForm>
    )
  }
)