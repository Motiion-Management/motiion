import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Platform, Alert } from 'react-native';
import PagerView from 'react-native-pager-view';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConvexDynamicForm } from '~/components/form/ConvexDynamicForm';
import { BottomSheetPicker } from '../ui/bottom-sheet-picker';
import { Button } from '~/components/ui/button';
import { Sheet } from '~/components/ui/sheet';
import { Text } from '~/components/ui/text';
import { Tabs } from '~/components/ui/tabs/tabs';

import { type ExperienceType, type Experience } from '~/types/experiences';
import { type Doc, type Id } from '@packages/backend/convex/_generated/dataModel';
import { getExperienceMetadata } from '~/utils/convexFormMetadata';
import { EXPERIENCE_TYPES } from '~/config/experienceTypes';
import { zExperiencesUnified } from '@packages/backend/convex/schemas';
import { useAppForm } from '~/components/form/appForm';
import { zodValidator } from '@tanstack/zod-form-adapter';
import * as Haptics from 'expo-haptics';
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation } from 'convex/react';
import { hydrateDates } from '~/utils/dateHelpers';
import { normalizeForConvex } from '~/utils/convexHelpers';
import { getDefaultsFromSchema, mergeFormValues } from '~/utils/formDefaults';
import { convexSchemaToFormConfig } from '~/utils/convexSchemaToForm';

// Constants
const BOTTOM_OFFSET_CUSHION = 8;
const MAX_VIEW_HEIGHT = '80vh' as const;
const HAPTIC_MEDIUM = Haptics.ImpactFeedbackStyle.Medium;
const HAPTIC_LIGHT = Haptics.ImpactFeedbackStyle.Light;

interface ExperienceEditSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  // Prefer passing the whole experience to avoid refetching
  experience?: Doc<'experiences'>;
  experienceId?: Id<'experiences'>;
}

const TABS = [
  { key: 'details', label: 'Details' },
  { key: 'team', label: 'Team' },
];

export function ExperienceEditSheet({
  isOpen,
  onOpenChange,
  experience,
  experienceId: experienceIdProp,
}: ExperienceEditSheetProps) {
  const experienceId = experience?._id ?? experienceIdProp;
  const insets = useSafeAreaInsets();

  // Convex mutation to persist an experience for the current user
  const addMyExperience = useMutation(api.users.experiences.addMyExperience);
  const updateExperience = useMutation(api.experiences.update);

  // Compute initial type and values up front, no effects
  const initialType = experience?.type as ExperienceType | undefined;

  // Combined UI state for better management
  const [uiState, setUiState] = useState({
    activeTab: 'details',
    pagerProgress: 0,
    actionsHeight: 0,
    isSaving: false,
  });

  const pagerRef = useRef<React.ElementRef<typeof PagerView> | null>(null);
  const [experienceType, setExperienceType] = useState<ExperienceType | undefined>(initialType);

  // Update experience type when experience prop changes (e.g., when editing different experience)
  useEffect(() => {
    if (experience?.type) {
      setExperienceType(experience.type as ExperienceType);
    }
  }, [experience]);

  const bottomSafeInset = insets.bottom || 0;
  const bottomCompensation = uiState.actionsHeight + bottomSafeInset + BOTTOM_OFFSET_CUSHION;

  const handleExperienceTypeChange = useCallback((value: ExperienceType | undefined) => {
    setExperienceType(value);
  }, []);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleNext = useCallback(async () => {
    if (uiState.activeTab === 'details') {
      setUiState((prev) => ({ ...prev, activeTab: 'team' }));
      pagerRef.current?.setPage?.(1);
      try {
        await Haptics.impactAsync(HAPTIC_MEDIUM);
      } catch (error) {
        // Haptics not available on this device
      }
    }
  }, [uiState.activeTab]);

  const handleTabChange = useCallback(
    (tab: string) => {
      if (tab === uiState.activeTab) return;
      if (!experienceType && tab === 'team') return;
      setUiState((prev) => ({ ...prev, activeTab: tab }));
      const nextIndex = tab === 'team' ? 1 : 0;
      pagerRef.current?.setPage?.(nextIndex);
    },
    [uiState.activeTab, experienceType]
  );

  const title = experienceId ? 'Edit Experience' : 'Add Experience';

  // Map type -> schema and metadata
  const schema = useMemo(() => zExperiencesUnified, []);

  const metadata = useMemo(() => {
    return experienceType ? getExperienceMetadata(experienceType) : {};
  }, [experienceType]);

  const sharedForm = useAppForm({
    defaultValues: {},
    validators: {
      onChange: zodValidator(schema as any),
    },
  });
  // Initialize form with data when component mounts or experience changes
  const initializedRef = useRef(false);
  const lastExperienceIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!sharedForm) return;

    const currentExperienceId = experience?._id ?? experienceId;
    const isNewExperience = currentExperienceId !== lastExperienceIdRef.current;

    // Initialize form data when:
    // 1. First mount
    // 2. Experience ID changes (switching between experiences)
    // 3. Experience type is set for the first time
    if (
      !initializedRef.current ||
      isNewExperience ||
      (experienceType && !(sharedForm as any).store?.getState?.().values?.type)
    ) {
      // Get schema defaults for the type
      const schemaDefaults = experienceType ? getDefaultsFromSchema(schema, experienceType) : {};

      // Hydrate dates from experience data
      const hydratedExperience = hydrateDates(experience ?? {});

      // Merge all values
      const formValues: Record<string, any> = {
        ...schemaDefaults,
        ...hydratedExperience,
      };

      // Set type if we have one
      if (experienceType) {
        formValues.type = experienceType;
      }

      // Set all form values
      for (const [key, value] of Object.entries(formValues)) {
        if (value !== undefined && typeof (sharedForm as any).setFieldValue === 'function') {
          try {
            (sharedForm as any).setFieldValue(key, value);
          } catch (error) {
            console.warn(`Failed to set field ${key}:`, error);
          }
        }
      }

      initializedRef.current = true;
      lastExperienceIdRef.current = currentExperienceId;
    }
  }, [experience, experienceId, experienceType, schema, sharedForm]);

  // Handle type changes separately
  useEffect(() => {
    if (!sharedForm || !experienceType) return;

    const currentType = (sharedForm as any).store?.getState?.().values?.type;

    // Only update if type actually changed
    if (currentType && currentType !== experienceType) {
      // Update type field
      (sharedForm as any).setFieldValue('type', experienceType);

      // Get new defaults for the new type
      const newDefaults = getDefaultsFromSchema(schema, experienceType);

      // Only update type-specific fields, preserve common fields
      const typeSpecificFields = [
        'title',
        'songTitle',
        'companyName',
        'festivalTitle',
        'tourName',
        'tourArtist',
        'eventName',
        'awardShowName',
        'productionTitle',
        'venue',
        'subtype',
        'studio',
        'artists',
        'productionCompany',
        'campaignTitle',
      ];

      for (const field of typeSpecificFields) {
        if (field in newDefaults) {
          (sharedForm as any).setFieldValue(field, newDefaults[field]);
        } else {
          // Clear fields that don't belong to new type
          (sharedForm as any).setFieldValue(field, undefined);
        }
      }
    }
  }, [experienceType, schema, sharedForm]);

  // Compute initial data for ConvexDynamicForm
  const fullInitialData = useMemo(() => {
    const values = (sharedForm as any)?.store?.getState?.().values ?? {};
    return {
      ...values,
      type: experienceType,
    };
  }, [experienceType, sharedForm]);

  // Enable/disable pager scroll programmatically as well, for platforms not respecting prop
  useEffect(() => {
    pagerRef.current?.setScrollEnabled?.(!!experienceType);
  }, [experienceType]);

  return (
    <Sheet
      isOpened={isOpen}
      label={title}
      onIsOpenedChange={(open) => {
        if (!open) {
          // Reset UI state
          setUiState((prev) => ({ ...prev, activeTab: 'details', pagerProgress: 0 }));
          pagerRef.current?.setPage?.(0);

          // Reset form state for next open
          initializedRef.current = false;
          lastExperienceIdRef.current = undefined;

          // Clear experience type if creating new
          if (!experience && !experienceId) {
            setExperienceType(undefined);
          }
        }
        onOpenChange(open);
      }}>
      <View className="h-[80vh]">
        {/* Tabs */}
        <Tabs
          tabs={TABS}
          activeTab={uiState.activeTab}
          onTabChange={handleTabChange}
          progress={uiState.pagerProgress}
          disabledKeys={!experienceType ? ['team'] : []}
        />

        {/* Tab Content */}
        <PagerView
          ref={pagerRef}
          initialPage={0}
          style={{ flex: 1 }}
          scrollEnabled={!!experienceType}
          onPageScroll={(e) => {
            const { position = 0, offset = 0 } = e.nativeEvent || {};
            if (!experienceType) {
              if (position !== 0 || offset > 0) {
                pagerRef.current?.setPageWithoutAnimation?.(0);
              }
              setUiState((prev) => ({ ...prev, pagerProgress: 0 }));
              return;
            }
            setUiState((prev) => ({ ...prev, pagerProgress: position + offset }));
          }}
          onPageSelected={async (e) => {
            const idx = e.nativeEvent.position ?? 0;
            const nextTab = idx === 1 ? 'team' : 'details';
            if (nextTab !== uiState.activeTab) {
              setUiState((prev) => ({ ...prev, activeTab: nextTab }));
            }
            try {
              await Haptics.impactAsync(HAPTIC_LIGHT);
            } catch (error) {
              // Haptics not available on this device
            }
          }}>
          {/* Keep progress synced while swiping */}
          {/* onPageScroll provided as a sibling prop in RN; place after onPageSelected for readability */}
          {/* Details Page */}
          <View key="details" className="flex-1">
            <KeyboardAwareScrollView
              bounces={false}
              disableScrollOnKeyboardHide
              contentInsetAdjustmentBehavior="never"
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              bottomOffset={bottomCompensation}
              showsVerticalScrollIndicator={false}>
              <View className="flex-1 pt-2">
                <View className="gap-4 p-4">
                  <BottomSheetPicker
                    onChange={handleExperienceTypeChange}
                    label="Experience Type"
                    value={experienceType}
                    data={EXPERIENCE_TYPES}
                  />
                </View>
                <View className="px-4 pb-4 pt-4">
                  {experienceType && schema && (
                    <ConvexDynamicForm
                      schema={schema}
                      metadata={metadata}
                      initialData={fullInitialData}
                      groups={['details', 'basic', 'dates', 'media']}
                      exclude={['userId', 'private', 'type']}
                      debounceMs={300}
                      form={sharedForm}
                    />
                  )}
                </View>
              </View>
            </KeyboardAwareScrollView>
          </View>

          {/* Team Page */}
          <View key="team" className="flex-1">
            <KeyboardAwareScrollView
              bounces={false}
              disableScrollOnKeyboardHide
              contentInsetAdjustmentBehavior="never"
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              bottomOffset={bottomCompensation}
              showsVerticalScrollIndicator={false}>
              <View className="flex-1 pt-2">
                <View className="px-4 pb-4 pt-4">
                  {experienceType && schema && (
                    <ConvexDynamicForm
                      schema={schema}
                      metadata={metadata}
                      initialData={fullInitialData}
                      groups={['team']}
                      exclude={['userId', 'private', 'type']}
                      debounceMs={300}
                      form={sharedForm}
                    />
                  )}
                </View>
              </View>
            </KeyboardAwareScrollView>
          </View>
        </PagerView>

        {/* Actions */}
        <KeyboardStickyView
          offset={{
            closed: 0,
            opened: Platform.select({ ios: insets.bottom, default: insets.bottom }),
          }}>
          <View
            className="gap-2 border-t border-t-border-low bg-surface-default px-4 pb-8 pt-4"
            onLayout={(e) =>
              setUiState((prev) => ({ ...prev, actionsHeight: e.nativeEvent.layout.height }))
            }>
            {uiState.activeTab === 'details' ? (
              <Button onPress={handleNext} disabled={!experienceType} className="w-full">
                <Text>Next</Text>
              </Button>
            ) : (
              <Button
                onPress={async () => {
                  if (!experienceType) return;

                  // Gather current values directly from the form
                  const values = (sharedForm as any).store?.getState?.().values ?? {};

                  const completeData = {
                    ...values,
                    type: experienceType,
                  } as Experience;

                  const payload = normalizeForConvex(completeData);

                  try {
                    setUiState((prev) => ({ ...prev, isSaving: true }));
                    const idToUpdate = experience?._id ?? experienceId;

                    if (idToUpdate) {
                      await updateExperience({ id: idToUpdate, patch: payload });
                    } else {
                      await addMyExperience(payload);
                    }

                    handleClose();
                  } catch (error) {
                    const errorMessage =
                      error instanceof Error ? error.message : 'Failed to save experience';
                    console.error('Failed to save experience:', error);

                    Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
                  } finally {
                    setUiState((prev) => ({ ...prev, isSaving: false }));
                  }
                }}
                disabled={!experienceType || uiState.isSaving}
                className="w-full">
                <Text>{uiState.isSaving ? 'Saving…' : 'Save'}</Text>
              </Button>
            )}

            {/* Delete action removed; handled by parent flows if needed */}
          </View>
        </KeyboardStickyView>
      </View>
    </Sheet>
  );
}
