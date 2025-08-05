import React, { useState, useCallback, useEffect } from 'react'
import { View, Pressable } from 'react-native'

import { ExperienceForm } from './ExperienceForm'
import { ExperienceTeamForm } from './ExperienceTeamForm'
import { Button } from '~/components/ui/button'
import { Sheet } from '~/components/ui/sheet'
import { Text } from '~/components/ui/text'
import { Tabs, TabPanel } from '~/components/ui/tabs/tabs'
import X from '~/lib/icons/X'
import { 
  ExperienceType, 
  Experience,
  ExperienceFormState 
} from '~/types/experiences'
import { EXPERIENCE_TYPES } from '~/config/experienceTypes'

interface ExperienceEditSheetProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  experience?: ExperienceFormState | null
  onSave: (experience: ExperienceFormState) => void
  onDelete?: () => void
  isNew?: boolean
}

const TABS = [
  { key: 'details', label: 'Details' },
  { key: 'team', label: 'Team' }
]

export function ExperienceEditSheet({
  isOpen,
  onOpenChange,
  experience,
  onSave,
  onDelete,
  isNew = false
}: ExperienceEditSheetProps) {
  const [activeTab, setActiveTab] = useState('details')
  const [experienceType, setExperienceType] = useState<ExperienceType>(
    experience?.type || 'tv-film'
  )
  const [formData, setFormData] = useState<Partial<Experience>>(
    experience?.data || { type: experienceType }
  )
  const [teamData, setTeamData] = useState<Partial<Experience>>({
    mainTalent: experience?.data?.mainTalent || [],
    choreographers: experience?.data?.choreographers || [],
    associateChoreographers: experience?.data?.associateChoreographers || []
  })

  // Reset state when sheet opens with new experience
  useEffect(() => {
    if (isOpen) {
      setActiveTab('details')
      setExperienceType(experience?.type || 'tv-film')
      setFormData(experience?.data || { type: experience?.type || 'tv-film' })
      setTeamData({
        mainTalent: experience?.data?.mainTalent || [],
        choreographers: experience?.data?.choreographers || [],
        associateChoreographers: experience?.data?.associateChoreographers || []
      })
    }
  }, [isOpen, experience])

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handleFormChange = useCallback((data: Partial<Experience>) => {
    setFormData(prev => ({ ...prev, ...data, type: experienceType }))
  }, [experienceType])

  const handleTeamChange = useCallback((data: Partial<Experience>) => {
    setTeamData(data)
  }, [])

  const handleNext = useCallback(() => {
    if (activeTab === 'details') {
      setActiveTab('team')
    }
  }, [activeTab])

  const handleSave = useCallback(() => {
    const completeData: Experience = {
      ...formData,
      ...teamData,
      type: experienceType
    } as Experience

    // Check if required fields are filled
    const isComplete = checkExperienceComplete(completeData)

    const experienceToSave: ExperienceFormState = {
      id: experience?.id || `temp-${Date.now()}`,
      type: experienceType,
      data: completeData,
      isComplete
    }

    onSave(experienceToSave)
    handleClose()
  }, [formData, teamData, experienceType, experience, onSave, handleClose])

  const checkExperienceComplete = (data: Partial<Experience>): boolean => {
    // Basic validation - check if key fields are filled
    switch (data.type) {
      case 'tv-film':
        return !!(data.title && data.studio && data.roles?.length)
      case 'music-video':
        return !!(data.songTitle && data.artists?.length && data.roles?.length)
      case 'live-performance':
        return !!(data.eventType && data.roles?.length)
      case 'commercial':
        return !!(data.companyName && data.campaignTitle && data.roles?.length)
      default:
        return false
    }
  }

  const getTitle = () => {
    if (isNew) return 'Add Experience'
    return experience?.data ? 'Edit Experience' : 'Project 1'
  }

  return (
    <Sheet isOpened={isOpen} onIsOpenedChange={onOpenChange}>
      <View className="h-[600px]">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <Text variant="header4" className="text-text-default">
            {getTitle()}
          </Text>
          <Pressable onPress={handleClose} className="p-2">
            <X className="h-6 w-6 color-icon-default" />
          </Pressable>
        </View>

        {/* Experience Type Selector (only for new experiences) */}
        {isNew && activeTab === 'details' && (
          <View className="mb-4 px-4">
            <Text variant="labelSm" className="mb-2 text-text-low">
              Experience Type
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {EXPERIENCE_TYPES.map(type => (
                <Pressable
                  key={type.value}
                  onPress={() => {
                    setExperienceType(type.value)
                    setFormData({ type: type.value })
                  }}
                  className={`rounded-full border px-3 py-1.5 ${
                    experienceType === type.value
                      ? 'border-border-accent bg-surface-accent'
                      : 'border-border-default bg-surface-high'
                  }`}>
                  <Text variant="footnote" className="text-text-default">
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Tabs */}
        <Tabs 
          tabs={TABS} 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <View className="flex-1 px-4 pt-4">
          <TabPanel isActive={activeTab === 'details'}>
            <ExperienceForm
              experienceType={experienceType}
              initialData={formData}
              onChange={handleFormChange}
            />
          </TabPanel>

          <TabPanel isActive={activeTab === 'team'}>
            <ExperienceTeamForm
              initialData={teamData}
              onChange={handleTeamChange}
            />
          </TabPanel>
        </View>

        {/* Actions */}
        <View className="gap-2 px-4 pb-8 pt-4">
          {activeTab === 'details' ? (
            <Button onPress={handleNext} className="w-full">
              <Text>Next</Text>
            </Button>
          ) : (
            <Button onPress={handleSave} className="w-full">
              <Text>Save</Text>
            </Button>
          )}
          
          {!isNew && onDelete && (
            <Button 
              variant="secondary" 
              onPress={onDelete} 
              className="w-full">
              <Text className="text-red-600">Delete</Text>
            </Button>
          )}
        </View>
      </View>
    </Sheet>
  )
}