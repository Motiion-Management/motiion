import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Platform, Alert } from 'react-native';
import PagerView from 'react-native-pager-view';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConvexDynamicForm } from '~/components/form/ConvexDynamicForm';
import { Button } from '~/components/ui/button';
import { Sheet } from '~/components/ui/sheet';
import { Text } from '~/components/ui/text';
import { Tabs } from '~/components/ui/tabs/tabs';

import { type ExperienceType, type Experience } from '~/types/experiences';
import { type Doc, type Id } from '@packages/backend/convex/_generated/dataModel';
import { experienceMetadata } from '~/utils/convexFormMetadata';
import { useAppForm } from '~/components/form/appForm';
import { useStore } from '@tanstack/react-form';
import * as Haptics from 'expo-haptics';
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation } from 'convex/react';
import { normalizeForConvex } from '~/utils/convexHelpers';

import { zExperiencesDoc } from '@packages/backend/convex/validators/experiences';

// Constants
const BOTTOM_OFFSET_CUSHION = 8;
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

  // Combined UI state for better management
  const [uiState, setUiState] = useState({
    activeTab: 'details',
    pagerProgress: 0,
    actionsHeight: 0,
    isSaving: false,
  });

  const pagerRef = useRef<React.ElementRef<typeof PagerView> | null>(null);

  const bottomSafeInset = insets.bottom || 0;
  const bottomCompensation = uiState.actionsHeight + bottomSafeInset + BOTTOM_OFFSET_CUSHION;

  // Type is managed by the form; no external setter required

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

  // handleTabChange will be defined after form initialization

  const title = experienceId ? 'Edit Experience' : 'Add Experience';

  // Map type -> schema and metadata
  // Use shared backend validator schema for single source of truth (full doc shape)
  const schema = zExperiencesDoc.passthrough();

  // Initialize shared form controller with onSubmit handling
  const addMyExperience = useMutation(api.users.experiences.addMyExperience);
  const updateExperience = useMutation(api.experiences.update);

  const sharedForm = useAppForm({
    defaultValues: experience,
    validators: {
      onChange: schema,
    },
    onSubmit: async ({ value }) => {
      console.log('Submitting experience:', value);
      const payload = normalizeForConvex(value as Experience);
      try {
        setUiState((prev) => ({ ...prev, isSaving: true }));
        const idToUpdate = experience?._id ?? experienceId;
        if (idToUpdate) {
          await updateExperience({ id: idToUpdate, patch: payload });
        } else {
          await addMyExperience(payload);
        }
        // Reset via form controller and close
        sharedForm.reset();
        handleClose();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save experience';
        console.error('Failed to save experience:', error);
        Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
      } finally {
        setUiState((prev) => ({ ...prev, isSaving: false }));
      }
    },
  });

  const canSubmit = useStore(sharedForm.store, (state: any) => state.canSubmit);
  // Track current selected type from the form store to drive UI
  const selectedType = useStore(sharedForm.store, (state: any) => state.values?.type) as
    | ExperienceType
    | undefined;

  const metadata = useMemo(() => {
    return selectedType ? experienceMetadata[selectedType] : {};
  }, [selectedType]);

  // Pager scroll is controlled via the `scrollEnabled` prop; avoid imperative commands

  // No per-field overrides; rely on base metadata

  const handleTabChange = useCallback(
    (tab: string) => {
      if (tab === uiState.activeTab) return;
      const t = selectedType;
      if (!t && tab === 'team') return;
      setUiState((prev) => ({ ...prev, activeTab: tab }));
      const nextIndex = tab === 'team' ? 1 : 0;
      pagerRef.current?.setPage?.(nextIndex);
    },
    [uiState.activeTab, selectedType]
  );

  return (
    <Sheet
      isOpened={isOpen}
      label={title}
      onIsOpenedChange={(open) => {
        if (!open) {
          // Reset UI state
          setUiState((prev) => ({ ...prev, activeTab: 'details', pagerProgress: 0 }));
          pagerRef.current?.setPage?.(0);
          // Reset form state for next open via controller
          (sharedForm as any)?.reset?.();
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
          disabledKeys={!selectedType ? ['team'] : []}
        />

        {/* Tab Content */}
        <PagerView
          ref={pagerRef}
          initialPage={0}
          style={{ flex: 1 }}
          scrollEnabled={!!selectedType}
          onPageScroll={(e) => {
            const { position = 0, offset = 0 } = e.nativeEvent || {};
            if (!selectedType) {
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
              console.warn('Haptics error:', error);
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
                {/* Experience type is rendered within the dynamic form via discriminator */}
                <View className="px-4 pb-4 pt-4">
                  {schema && (
                    <ConvexDynamicForm
                      key={`details`}
                      schema={schema}
                      metadata={metadata}
                      // initialData={}
                      groups={['details', 'basic', 'dates', 'media']}
                      exclude={['userId', 'private']}
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
                  {schema && (
                    <ConvexDynamicForm
                      key={`team`}
                      schema={schema}
                      metadata={metadata}
                      // initialData={fullInitialData}
                      groups={['team']}
                      exclude={['userId', 'private']}
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
              <Button onPress={handleNext} disabled={!selectedType} className="w-full">
                <Text>Next</Text>
              </Button>
            ) : (
              <Button
                onPress={sharedForm.handleSubmit}
                disabled={uiState.isSaving || !canSubmit}
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
