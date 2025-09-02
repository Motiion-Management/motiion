import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { View, Platform, Alert } from 'react-native';
import PagerView from 'react-native-pager-view';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConvexDynamicForm } from '~/components/form/ConvexDynamicForm';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { Tabs } from '~/components/ui/tabs/tabs';
import { type ExperienceType, type Experience } from '~/types/experiences';
import { type Id } from '@packages/backend/convex/_generated/dataModel';
import {
  experienceMetadata,
  baseExperienceMetadata,
  initialExperienceMetadata,
} from '~/utils/convexFormMetadata';
import { useAppForm } from '~/components/form/appForm';
import { useStore } from '@tanstack/react-form';
import * as Haptics from 'expo-haptics';
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation } from 'convex/react';
import { normalizeForConvex } from '~/utils/convexHelpers';
import {
  zExperiencesDoc,
  type ProjectFormDoc,
} from '@packages/backend/convex/validators/projects';

// Type alias for backward compatibility
type ExperienceFormDoc = ProjectFormDoc;
import { useQuery } from 'convex/react';
import { toast } from 'sonner-native';
import { z } from 'zod';

const BOTTOM_OFFSET_CUSHION = 8;
const HAPTIC_MEDIUM = Haptics.ImpactFeedbackStyle.Medium;
const HAPTIC_LIGHT = Haptics.ImpactFeedbackStyle.Light;

const TABS = [
  { key: 'details', label: 'Details' },
  { key: 'team', label: 'Team' },
];

interface ExperienceEditFormProps {
  onClose: () => void;
  experience?: ExperienceFormDoc;
  experienceId?: Id<'experiences'>;
  showActions?: boolean;
  onValidChange?: (valid: boolean) => void;
  afterSubmit?: () => void;
}

export interface ExperienceEditFormHandle {
  submit: () => void;
}

export const ExperienceEditForm = forwardRef<ExperienceEditFormHandle, ExperienceEditFormProps>(
  (
    {
      onClose,
      experience,
      experienceId: experienceIdProp,
      showActions = true,
      onValidChange,
      afterSubmit,
    },
    ref
  ) => {
    const insets = useSafeAreaInsets();

    // Allow fetching existing doc by id if not provided
    const myExperiences = useQuery(api.users.projects.getMyProjects, {});
    const experienceFromQuery = useMemo<ExperienceFormDoc | undefined>(() => {
      const id = experience?._id ?? experienceIdProp;
      if (!id || !Array.isArray(myExperiences)) return undefined;
      const list = myExperiences as unknown as ExperienceFormDoc[];
      return list.find((e) => e._id === id);
    }, [experience?._id, experienceIdProp, myExperiences]);

    const experienceId = (experience?._id ?? experienceIdProp) as Id<'experiences'> | undefined;

    const initialUiState = { activeTab: 'details', actionsHeight: 0, isSaving: false };
    const [uiState, setUiState] = useState(initialUiState);

    const pagerRef = useRef<React.ElementRef<typeof PagerView> | null>(null);
    const bottomSafeInset = insets.bottom || 0;
    const bottomCompensation = uiState.actionsHeight + bottomSafeInset + BOTTOM_OFFSET_CUSHION;

    const handleNext = useCallback(async () => {
      if (uiState.activeTab === 'details') {
        setUiState((prev) => ({ ...prev, activeTab: 'team' }));
        pagerRef.current?.setPage?.(1);
        try {
          await Haptics.impactAsync(HAPTIC_MEDIUM);
        } catch {}
      }
    }, [uiState.activeTab]);

    const title = experienceId ? 'Edit Experience' : 'Add Experience';

    const uiSchema = zExperiencesDoc.passthrough();
    // Accept Date objects from the UI for start/end dates; backend normalization converts to ISO
    const validateSchema = zExperiencesDoc
      .omit({ userId: true })
      .extend({
        startDate: z.union([z.string(), z.date()]).optional(),
        endDate: z.union([z.string(), z.date()]).optional(),
      })
      .passthrough();

    const addMyExperience = useMutation(api.users.projects.addMyProject);
    const updateExperience = useMutation(api.projects.update);
    const destroyExperience = useMutation(api.projects.destroy);

    const selectedExperience = experience ?? (experienceFromQuery as ExperienceFormDoc | undefined);

    const sharedForm = useAppForm({
      defaultValues: {
        ...selectedExperience,
      },
      validators: { onChange: validateSchema, onSubmit: validateSchema },
      onSubmit: async ({ value }) => {
        console.log('Submitting experience form with value:', value);
        const payload = normalizeForConvex(value as Experience);
        try {
          setUiState((prev) => ({ ...prev, isSaving: true }));
          const idToUpdate = selectedExperience?._id ?? experienceId;
          if (idToUpdate) {
            await updateExperience({ id: idToUpdate, patch: payload });
          } else {
            await addMyExperience(payload);
          }
          console.log('Experience saved successfully');
          if (afterSubmit) afterSubmit();
          else onClose();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to save experience';
          console.error('Failed to save experience:', error);
          Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
        } finally {
          setUiState((prev) => ({ ...prev, isSaving: false }));
        }
      },
    });

    const canSubmit = useStore(sharedForm.store, (state) => state.canSubmit as boolean);
    type ExperienceValues = z.infer<typeof validateSchema>;
    const formValues = useStore(sharedForm.store, (state) => state.values as ExperienceValues);
    const valuesRef = useRef<ExperienceValues>(formValues);
    useEffect(() => {
      valuesRef.current = formValues;
    }, [formValues]);

    useEffect(() => {
      onValidChange?.(!!canSubmit);
    }, [canSubmit, onValidChange]);
    const selectedType = useStore(sharedForm.store, (state: any) => state.values?.type) as
      | ExperienceType
      | undefined;

    const metadata = useMemo(() => {
      if (!selectedType) return initialExperienceMetadata;
      return experienceMetadata[selectedType] ?? baseExperienceMetadata;
    }, [selectedType]);

    const detailsInclude = useMemo(() => {
      return selectedType ? undefined : ['type'];
    }, [selectedType]);

    const handleTabChange = useCallback(
      (tab: string) => {
        if (tab === uiState.activeTab) return;
        if (!selectedType && tab === 'team') return;
        setUiState((prev) => ({ ...prev, activeTab: tab }));
        pagerRef.current?.setPage?.(tab === 'team' ? 1 : 0);
      },
      [uiState.activeTab, selectedType]
    );

    useImperativeHandle(ref, () => ({ submit: () => sharedForm.handleSubmit() }));

    // No monkey-patching handleSubmit; validation feedback is tied to submit press below

    return (
      <View className="flex-1">
        {/* Tabs */}
        <Tabs
          tabs={TABS}
          activeTab={uiState.activeTab}
          onTabChange={handleTabChange}
          disabledKeys={!selectedType ? ['team'] : []}
        />

        {/* Content */}
        {selectedType ? (
          <PagerView
            ref={pagerRef}
            initialPage={0}
            style={{ flex: 1 }}
            scrollEnabled={true}
            onPageSelected={async (e) => {
              const idx = e.nativeEvent.position ?? 0;
              const nextTab = idx === 1 ? 'team' : 'details';
              if (nextTab !== uiState.activeTab)
                setUiState((prev) => ({ ...prev, activeTab: nextTab }));
              try {
                await Haptics.impactAsync(HAPTIC_LIGHT);
              } catch {
                // no-op
              }
            }}>
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
                  <View className="px-4 pb-4 pt-4">
                    {uiSchema && (
                      <ConvexDynamicForm
                        key={`details`}
                        schema={uiSchema}
                        metadata={metadata}
                        groups={['details', 'basic', 'dates', 'media']}
                        exclude={['private']}
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
                    {uiSchema && (
                      <ConvexDynamicForm
                        key={`team`}
                        schema={uiSchema}
                        metadata={metadata}
                        groups={['team']}
                        exclude={['private']}
                        debounceMs={300}
                        form={sharedForm}
                      />
                    )}
                  </View>
                </View>
              </KeyboardAwareScrollView>
            </View>
          </PagerView>
        ) : (
          <View className="flex-1">
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
                  {uiSchema && (
                    <ConvexDynamicForm
                      key={`details-initial`}
                      schema={uiSchema}
                      metadata={metadata}
                      groups={['details', 'basic', 'dates', 'media']}
                      include={detailsInclude}
                      exclude={['private']}
                      debounceMs={300}
                      form={sharedForm}
                    />
                  )}
                </View>
              </View>
            </KeyboardAwareScrollView>
          </View>
        )}

        {showActions && (
          <KeyboardStickyView
            offset={{
              closed: 0,
              opened: Platform.select({ ios: insets.bottom, default: insets.bottom }),
            }}>
            <View
              className="gap-2 border-t border-t-border-low bg-surface-default px-4 pb-8 pt-4"
              onLayout={(e) => {
                const height = e.nativeEvent?.layout?.height ?? 0;
                setUiState((prev) => ({ ...prev, actionsHeight: height }));
              }}>
              {uiState.activeTab === 'details' ? (
                <Button onPress={handleNext} disabled={!selectedType} className="w-full">
                  <Text>Next</Text>
                </Button>
              ) : (
                <Button
                  onPress={() => {
                    const parsed = validateSchema.safeParse(valuesRef.current);
                    if (!parsed.success) {
                      const msg =
                        parsed.error.errors?.[0]?.message ||
                        'Please correct the highlighted fields.';
                      toast.error(msg);
                    }
                    sharedForm.handleSubmit();
                  }}
                  disabled={uiState.isSaving}
                  className="w-full">
                  <Text>{uiState.isSaving ? 'Saving…' : 'Save'}</Text>
                </Button>
              )}
              {selectedExperience?._id && (
                <Button
                  variant="plain"
                  className="w-full"
                  onPress={() => {
                    Alert.alert(
                      'Delete Experience',
                      'Are you sure you want to delete this experience? This action cannot be undone.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              if (selectedExperience?._id) {
                                await destroyExperience({ id: selectedExperience._id });
                              }
                              onClose();
                            } catch (error) {
                              const errorMessage =
                                error instanceof Error
                                  ? error.message
                                  : 'Failed to delete experience';
                              console.error('Failed to delete experience:', error);
                              Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
                            }
                          },
                        },
                      ]
                    );
                  }}>
                  <Text className="text-destructive">Delete Experience</Text>
                </Button>
              )}
            </View>
          </KeyboardStickyView>
        )}
      </View>
    );
  }
);
