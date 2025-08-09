import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Platform } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConvexDynamicForm } from '~/components/form/ConvexDynamicForm';
import { BottomSheetPicker } from '../ui/bottom-sheet-picker';
import { Button } from '~/components/ui/button';
import { Sheet } from '~/components/ui/sheet';
import { Text } from '~/components/ui/text';
import { Tabs } from '~/components/ui/tabs/tabs';

import { ExperienceType, Experience, ExperienceFormState } from '~/types/experiences';
import { getExperienceMetadata } from '~/utils/convexFormMetadata';
import { EXPERIENCE_TYPES } from '~/config/experienceTypes';
import {
  zExperiencesTvFilm,
  zExperiencesMusicVideos,
  zExperiencesLivePerformances,
  zExperiencesCommercials,
} from '@packages/backend/convex/schemas';

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
  const [experienceType, setExperienceType] = useState<ExperienceType | undefined>(
    experience?.type
  );
  const [formData, setFormData] = useState<Partial<Experience>>(experience?.data || {});
  // Single-form approach: all fields live in formData via ConvexDynamicForm

  // Reset state when sheet opens with new experience
  useEffect(() => {
    if (isOpen) {
      setActiveTab('details');
      setExperienceType(experience?.type);
      setFormData(experience?.data || {});
      // formData is authoritative; team fields are included in dynamic form
    }
  }, [isOpen, experience]);

  // Handle experience type change
  const handleExperienceTypeChange = useCallback(
    (value: ExperienceType | undefined) => {
      console.log('Selected experience type:', value);
      if (value) {
        setExperienceType(value);
        // Clear form data when changing type for new experiences
        if (isNew) {
          setFormData({ type: value });
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

  // No separate team change; dynamic form updates formData for both steps

  const handleNext = useCallback(() => {
    if (activeTab === 'details') {
      setActiveTab('team');
    }
  }, [activeTab]);

  const handleSave = useCallback(() => {
    if (!experienceType) return;

    const completeData: Experience = {
      ...formData,
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
  }, [formData, experienceType, experience, onSave, handleClose]);

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

  // Map type -> schema and metadata
  const schema = useMemo(() => {
    switch (experienceType) {
      case 'tv-film':
      case 'television-film':
        return zExperiencesTvFilm;
      case 'music-video':
      case 'music-videos':
        return zExperiencesMusicVideos;
      case 'live-performance':
      case 'live-performances':
        return zExperiencesLivePerformances;
      case 'commercial':
      case 'commercials':
        return zExperiencesCommercials;
      default:
        return undefined;
    }
  }, [experienceType]);

  const metadata = useMemo(() => {
    return experienceType ? getExperienceMetadata(experienceType) : {};
  }, [experienceType]);

  // Group mapping for tabs
  const currentGroups = useMemo(() => {
    return activeTab === 'details' ? ['details', 'basic', 'dates', 'media'] : ['team'];
  }, [activeTab]);

  return (
    <Sheet isOpened={isOpen} label={getTitle()} onIsOpenedChange={onOpenChange}>
      <View className="h-[82vh]">
        {/* Tabs */}
        <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <KeyboardAwareScrollView
          bounces={false}
          disableScrollOnKeyboardHide
          contentInsetAdjustmentBehavior="never"
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="flex-1 pt-2">
            {/* Type selector only on Details tab */}
            {activeTab === 'details' && (
              <View className="gap-4 px-4 pb-2 pt-4">
                <BottomSheetPicker
                  onChange={handleExperienceTypeChange}
                  label="Experience Type"
                  value={experienceType}
                  data={EXPERIENCE_TYPES}
                />
              </View>
            )}

            {/* Single dynamic form instance; filters fields by groups per tab */}
            <View className="px-4 pb-4 pt-4">
              {experienceType && schema && (
                <ConvexDynamicForm
                  schema={schema}
                  metadata={metadata}
                  initialData={formData}
                  onChange={handleFormChange}
                  groups={currentGroups}
                  exclude={['userId', 'private', 'type']}
                  debounceMs={300}
                />
              )}
            </View>
          </View>
        </KeyboardAwareScrollView>

        {/* Actions */}
        <KeyboardStickyView
          offset={{
            closed: 0,
            opened: Platform.select({ ios: insets.bottom, default: insets.bottom }),
          }}>
          <View className="gap-2 border-t border-t-border-low bg-surface-default px-4 pb-8 pt-4">
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
