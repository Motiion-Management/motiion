import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Platform } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConvexDynamicForm } from '~/components/form/ConvexDynamicForm';
import { BottomSheetPicker } from '../ui/bottom-sheet-picker';
import { Button } from '~/components/ui/button';
import { Sheet } from '~/components/ui/sheet';
import { Text } from '~/components/ui/text';
import { Tabs } from '~/components/ui/tabs/tabs';

import { ExperienceType, Experience } from '~/types/experiences';
import { getExperienceMetadata } from '~/utils/convexFormMetadata';
import { EXPERIENCE_TYPES } from '~/config/experienceTypes';
import { zExperiencesUnified } from '@packages/backend/convex/schemas';
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';

interface ExperienceEditSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  experienceId?: string;
}

const TABS = [
  { key: 'details', label: 'Details' },
  { key: 'team', label: 'Team' },
];

export function ExperienceEditSheet({
  isOpen,
  onOpenChange,
  experienceId,
}: ExperienceEditSheetProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('details');
  const [experienceType, setExperienceType] = useState<ExperienceType | undefined>(undefined);
  const formDataRef = useRef<Partial<Experience>>({});
  const [actionsHeight, setActionsHeight] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const bottomSafeInset = insets.bottom || 0;
  const bottomCompensation = actionsHeight + bottomSafeInset + 8; // small cushion for caret
  // Single-form approach: form data buffered in ref to avoid parent re-renders

  // Convex mutation to persist an experience for the current user
  const addMyExperience = useMutation(api.users.experiences.addMyExperience);
  const updateExperience = useMutation(api.experiences.update);

  // Load the experience when editing
  const existingExperience = useQuery(
    (api as any).experiences.read,
    experienceId ? { id: experienceId as any } : 'skip'
  ) as any | undefined;

  // Reset state when sheet opens; if editing, seed from backend doc
  useEffect(() => {
    if (isOpen) {
      setActiveTab('details');
      if (experienceId && existingExperience) {
        setExperienceType(existingExperience.type as ExperienceType);
        formDataRef.current = existingExperience as Partial<Experience>;
      } else {
        setExperienceType(undefined);
        formDataRef.current = {};
      }
      // formData is authoritative; team fields are included in dynamic form
    }
  }, [isOpen, experienceId, existingExperience]);

  // Handle experience type change
  const handleExperienceTypeChange = useCallback(
    (value: ExperienceType | undefined) => {
      console.log('Selected experience type:', value);
      if (value) {
        setExperienceType(value);
        // Clear form data when changing type for new experiences
        if (!experienceId) {
          formDataRef.current = { type: value } as Partial<Experience>;
        }
      }
    },
    [experienceId]
  );

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleFormChange = useCallback((data: Partial<Experience>) => {
    formDataRef.current = { ...formDataRef.current, ...data };
  }, []);

  // No separate team change; dynamic form updates formData for both steps

  const handleNext = useCallback(() => {
    if (activeTab === 'details') {
      setActiveTab('team');
    }
  }, [activeTab]);

  const handleSave = useCallback(async () => {
    if (!experienceType) return;

    const completeData: Experience = {
      ...formDataRef.current,
      type: experienceType,
    } as Experience;

    // Check if required fields are filled
    const isComplete = checkExperienceComplete(completeData);

    try {
      setIsSaving(true);
      if (experienceId) {
        // Update existing
        await updateExperience({ id: experienceId as any, patch: completeData as any });
      } else {
        // Create new; server returns new id
        await addMyExperience(completeData as any);
      }
      handleClose();
    } catch (err) {
      console.error('Failed to save experience:', err);
    } finally {
      setIsSaving(false);
    }
  }, [experienceType, experienceId, handleClose, addMyExperience, updateExperience]);

  const checkExperienceComplete = (data: Partial<Experience>): boolean => {
    // Basic validation - check if key fields are filled
    switch (data.type) {
      case 'tv-film':
        return !!(data.title && data.studio && data.roles?.length);
      case 'music-video':
        return !!(data.songTitle && data.artists?.length && data.roles?.length);
      case 'live-performance':
        return !!(data.subtype && data.roles?.length);
      case 'commercial':
        return !!(data.companyName && data.campaignTitle && data.roles?.length);
      default:
        return false;
    }
  };

  const getTitle = () => {
    return experienceId ? 'Edit Experience' : 'Add Experience';
  };

  // Map type -> schema and metadata
  const schema = useMemo(() => zExperiencesUnified, []);

  const metadata = useMemo(() => {
    return experienceType ? getExperienceMetadata(experienceType) : {};
  }, [experienceType]);

  // Group mapping for tabs
  const currentGroups = useMemo(() => {
    return activeTab === 'details' ? ['details', 'basic', 'dates', 'media'] : ['team'];
  }, [activeTab]);

  // Stable memoized initial data for the dynamic form (must not be created conditionally)
  const initialFormData = useMemo(
    () => ({ ...formDataRef.current, type: experienceType }),
    [isOpen, experienceType, experienceId, existingExperience?._id]
  );
  const resetKey = `${isOpen}|${experienceId ?? 'new'}|${experienceType ?? ''}`;

  return (
    <Sheet isOpened={isOpen} label={getTitle()} onIsOpenedChange={onOpenChange}>
      <View className="h-[80vh]">
        {/* Tabs */}
        <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <KeyboardAwareScrollView
          bounces={false}
          disableScrollOnKeyboardHide
          contentInsetAdjustmentBehavior="never"
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          bottomOffset={bottomCompensation}
          showsVerticalScrollIndicator={false}>
          <View className="flex-1 pt-2">
            {/* Type selector only on Details tab */}
            {activeTab === 'details' && (
              <View className="gap-4 px-4 pt-4">
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
                  initialData={initialFormData}
                  resetKey={resetKey}
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
          <View
            className="gap-2 border-t border-t-border-low bg-surface-default px-4 pb-8 pt-4"
            onLayout={(e) => setActionsHeight(e.nativeEvent.layout.height)}>
            {activeTab === 'details' ? (
              <Button onPress={handleNext} disabled={!experienceType} className="w-full">
                <Text>Next</Text>
              </Button>
            ) : (
              <Button
                onPress={handleSave}
                disabled={!experienceType || isSaving}
                className="w-full">
                <Text>{isSaving ? 'Saving…' : 'Save'}</Text>
              </Button>
            )}

            {/* Delete action removed; handled by parent flows if needed */}
          </View>
        </KeyboardStickyView>
      </View>
    </Sheet>
  );
}
