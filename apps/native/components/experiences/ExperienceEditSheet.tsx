import React, { useState, useCallback, useEffect } from 'react';
import { View, Pressable, Platform } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExperienceForm } from './ExperienceForm';
import { ExperienceTeamForm } from './ExperienceTeamForm';
import { Button } from '~/components/ui/button';
import { Sheet } from '~/components/ui/sheet';
import { Text } from '~/components/ui/text';
import { Tabs, TabPanel } from '~/components/ui/tabs/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import X from '~/lib/icons/X';
import { ExperienceType, Experience, ExperienceFormState } from '~/types/experiences';
import { EXPERIENCE_TYPES } from '~/config/experienceTypes';

interface ExperienceEditSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  experience?: ExperienceFormState | null;
  onSave: (experience: ExperienceFormState) => void;
  onDelete?: () => void;
  isNew?: boolean;
}

const TABS = [
  { key: 'details', label: 'Details' },
  { key: 'team', label: 'Team' },
];

export function ExperienceEditSheet({
  isOpen,
  onOpenChange,
  experience,
  onSave,
  onDelete,
  isNew = false,
}: ExperienceEditSheetProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('details');
  const [experienceType, setExperienceType] = useState<ExperienceType | null>(
    experience?.type || null
  );
  const [formData, setFormData] = useState<Partial<Experience>>(experience?.data || {});
  const [teamData, setTeamData] = useState<Partial<Experience>>({
    mainTalent: experience?.data?.mainTalent || [],
    choreographers: experience?.data?.choreographers || [],
    associateChoreographers: experience?.data?.associateChoreographers || [],
  });

  // Reset state when sheet opens with new experience
  useEffect(() => {
    if (isOpen) {
      setActiveTab('details');
      setExperienceType(experience?.type || null);
      setFormData(experience?.data || {});
      setTeamData({
        mainTalent: experience?.data?.mainTalent || [],
        choreographers: experience?.data?.choreographers || [],
        associateChoreographers: experience?.data?.associateChoreographers || [],
      });
    }
  }, [isOpen, experience]);

  // Handle experience type change
  const handleExperienceTypeChange = useCallback(
    (value: { value: string; label: string } | undefined) => {
      if (value) {
        const newType = value.value as ExperienceType;
        setExperienceType(newType);
        // Clear form data when changing type for new experiences
        if (isNew) {
          setFormData({ type: newType });
        }
      }
    },
    [isNew]
  );

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleFormChange = useCallback((data: Partial<Experience>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const handleTeamChange = useCallback((data: Partial<Experience>) => {
    setTeamData(data);
  }, []);

  const handleNext = useCallback(() => {
    if (activeTab === 'details') {
      setActiveTab('team');
    }
  }, [activeTab]);

  const handleSave = useCallback(() => {
    if (!experienceType) return;

    const completeData: Experience = {
      ...formData,
      ...teamData,
      type: experienceType,
    } as Experience;

    // Check if required fields are filled
    const isComplete = checkExperienceComplete(completeData);

    const experienceToSave: ExperienceFormState = {
      id: experience?.id || `temp-${Date.now()}`,
      type: experienceType,
      data: completeData,
      isComplete,
    };

    onSave(experienceToSave);
    handleClose();
  }, [formData, teamData, experienceType, experience, onSave, handleClose]);

  const checkExperienceComplete = (data: Partial<Experience>): boolean => {
    // Basic validation - check if key fields are filled
    switch (data.type) {
      case 'tv-film':
        return !!(data.title && data.studio && data.roles?.length);
      case 'music-video':
        return !!(data.songTitle && data.artists?.length && data.roles?.length);
      case 'live-performance':
        return !!(data.eventType && data.roles?.length);
      case 'commercial':
        return !!(data.companyName && data.campaignTitle && data.roles?.length);
      default:
        return false;
    }
  };

  const getTitle = () => {
    return experience?.data ? 'Edit Experience' : 'Add Experience';
  };

  return (
    <Sheet isOpened={isOpen} onIsOpenedChange={onOpenChange}>
      <View className="h-[82vh]">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <Text variant="header4" className="text-text-default">
            {getTitle()}
          </Text>
          <Pressable onPress={handleClose} className="p-2">
            <X className="h-6 w-6 color-icon-default" />
          </Pressable>
        </View>

        {/* Tabs */}
        <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <View className="flex-1">
          <TabPanel isActive={activeTab === 'details'}>
            <KeyboardAwareScrollView
              bounces={false}
              disableScrollOnKeyboardHide
              contentInsetAdjustmentBehavior="never"
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View className="gap-4 px-4 pb-4 pt-4">
                {/* Experience Type Selector */}
                <View>
                  <Text variant="labelSm" className="mb-2 uppercase tracking-[0.6px] text-text-low">
                    Experience Type
                  </Text>
                  <Select
                    value={
                      experienceType
                        ? {
                          value: experienceType,
                          label:
                            EXPERIENCE_TYPES.find((t) => t.value === experienceType)?.label ||
                            experienceType,
                        }
                        : undefined
                    }
                    onValueChange={handleExperienceTypeChange}>
                    <SelectTrigger className="h-12 rounded-[29px] border-border-default bg-surface-high">
                      <SelectValue
                        className="text-text-default"
                        placeholder="Select experience type..."
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {EXPERIENCE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value} label={type.label}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </View>

                {/* Experience Form - Only render when type is selected */}
                {experienceType && (
                  <ExperienceForm
                    experienceType={experienceType}
                    initialData={formData}
                    onChange={handleFormChange}
                  />
                )}
              </View>
            </KeyboardAwareScrollView>
          </TabPanel>

          <TabPanel isActive={activeTab === 'team'}>
            <KeyboardAwareScrollView
              bounces={false}
              disableScrollOnKeyboardHide
              contentInsetAdjustmentBehavior="never"
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View className="px-4 pb-4 pt-4">
                <ExperienceTeamForm initialData={teamData} onChange={handleTeamChange} />
              </View>
            </KeyboardAwareScrollView>
          </TabPanel>
        </View>

        {/* Actions */}
        <KeyboardStickyView
          offset={{
            closed: 0,
            opened: Platform.select({ ios: insets.bottom, default: insets.bottom }),
          }}>
          <View className="gap-2 border-t border-t-border-low px-4 pb-8 pt-4 bg-surface-default">
            {activeTab === 'details' ? (
              <Button onPress={handleNext} disabled={!experienceType} className="w-full">
                <Text>Next</Text>
              </Button>
            ) : (
              <Button onPress={handleSave} disabled={!experienceType} className="w-full">
                <Text>Save</Text>
              </Button>
            )}

            {!isNew && onDelete && (
              <Button variant="secondary" onPress={onDelete} className="w-full">
                <Text className="text-red-600">Delete</Text>
              </Button>
            )}
          </View>
        </KeyboardStickyView>
      </View>
    </Sheet>
  );
}
