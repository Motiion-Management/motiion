import React, { useState } from 'react'
import { View } from 'react-native'
import { TabbedExperienceForm } from '~/components/experiences/TabbedExperienceForm'
import { Text } from '~/components/ui/text'
import { useMutation } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'

/**
 * Example usage of the TabbedExperienceForm component
 */
export function TabbedExperienceFormExample() {
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  
  // Example mutations (you'd use your actual mutations)
  const createTvFilm = useMutation(api.experiences.tvfilm.addMyExperience)
  const updateTvFilm = useMutation(api.experiences.tvfilm.update)
  
  // Example existing experience for edit mode
  const existingExperience = {
    type: 'tv-film',
    title: 'A Nonsense Christmas',
    studio: 'Netflix',
    startDate: '2024-09-01',
    duration: '1 week',
    roles: ['Principal Dancer'],
    mainTalent: ['Sabrina Carpenter', 'Tyla'],
    choreographers: ['Jasmine JB Badie'],
  }

  const handleSubmit = async (data: Record<string, any>) => {
    console.log('Form submitted with data:', data)
    
    // Handle submission based on type and mode
    if (mode === 'create') {
      // Create new experience based on type
      switch (data.type) {
        case 'tv-film':
          // await createTvFilm(data)
          break
        // Add other types...
      }
    } else {
      // Update existing experience
      // await updateTvFilm({ id: existingId, ...data })
    }
  }

  const handleDelete = async () => {
    console.log('Delete experience')
    // await deleteTvFilm({ id: existingId })
  }

  return (
    <View className="flex-1">
      {/* Mode Toggle for Demo */}
      <View className="flex-row gap-2 p-4">
        <View className={`rounded-lg px-4 py-2 ${mode === 'create' ? 'bg-primary' : 'bg-surface-high'}`}>
          <Text 
            onPress={() => setMode('create')}
            className={mode === 'create' ? 'text-primary-foreground' : 'text-text-default'}
          >
            Create Mode
          </Text>
        </View>
        <View className={`rounded-lg px-4 py-2 ${mode === 'edit' ? 'bg-primary' : 'bg-surface-high'}`}>
          <Text 
            onPress={() => setMode('edit')}
            className={mode === 'edit' ? 'text-primary-foreground' : 'text-text-default'}
          >
            Edit Mode
          </Text>
        </View>
      </View>

      {/* The Form */}
      <TabbedExperienceForm
        mode={mode}
        initialType={mode === 'edit' ? existingExperience.type : undefined}
        initialData={mode === 'edit' ? existingExperience : {}}
        onSubmit={handleSubmit}
        onDelete={mode === 'edit' ? handleDelete : undefined}
      />
    </View>
  )
}

/**
 * Example showing how the form adapts to different experience types
 */
export function ExperienceTypeAdaptationExample() {
  const [selectedType, setSelectedType] = useState<string>()
  
  return (
    <View className="flex-1 p-4">
      <Text variant="heading" className="mb-4 text-xl">
        Type-Adaptive Form Demo
      </Text>
      
      <Text className="mb-6 text-text-disabled">
        Select different experience types to see how the form fields change dynamically.
      </Text>
      
      {/* Type Selector Buttons */}
      <View className="mb-6 gap-2">
        {['tv-film', 'music-video', 'live-performance', 'commercial'].map(type => (
          <View
            key={type}
            className={`rounded-lg px-4 py-3 ${
              selectedType === type ? 'bg-primary' : 'bg-surface-high'
            }`}
          >
            <Text
              onPress={() => setSelectedType(type)}
              className={selectedType === type ? 'text-primary-foreground' : 'text-text-default'}
            >
              {type.replace('-', ' ').toUpperCase()}
            </Text>
          </View>
        ))}
      </View>
      
      {/* Show form with selected type */}
      {selectedType && (
        <TabbedExperienceForm
          mode="create"
          initialType={selectedType}
          onSubmit={(data) => console.log('Submitted:', data)}
        />
      )}
    </View>
  )
}