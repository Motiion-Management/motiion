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
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConvexDynamicForm } from '~/components/form/ConvexDynamicForm';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { PagerTabView, type TabRoute, type PagerTabViewRef } from '~/components/ui/tabs';
import { type ProjectType, type Project } from '~/types/projects';
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
import { useMutation, useQuery } from 'convex/react';
import { normalizeForConvex } from '~/utils/convexHelpers';
import { z } from 'zod';
import { toast } from 'sonner-native';
import { zProjectsDoc, type ProjectFormDoc } from '@packages/backend/convex/schemas/projects';

const BOTTOM_OFFSET_CUSHION = 8;
const HAPTIC_MEDIUM = Haptics.ImpactFeedbackStyle.Medium;
const HAPTIC_LIGHT = Haptics.ImpactFeedbackStyle.Light;

const TABS: TabRoute[] = [
  { key: 'details', title: 'Details' },
  { key: 'team', title: 'Team' },
];

interface ProjectEditFormProps {
  onComplete?: () => void;
  project?: ProjectFormDoc;
  projectId?: Id<'projects'>;
  showActions?: boolean;
  onValidChange?: (valid: boolean) => void;
}

export interface ProjectEditFormHandle {
  submit: () => void;
}

export const ProjectEditForm = forwardRef<ProjectEditFormHandle, ProjectEditFormProps>(
  ({ onComplete, project, projectId: projectIdProp, showActions = true, onValidChange }, ref) => {
    const insets = useSafeAreaInsets();

    // Allow fetching existing doc by id if not provided
    const myProjects = useQuery(api.projects.getMyProjects, {});
    const projectFromQuery = useMemo<ProjectFormDoc | undefined>(() => {
      const id = project?._id ?? projectIdProp;
      if (!id || !Array.isArray(myProjects)) return undefined;
      const list = myProjects as unknown as ProjectFormDoc[];
      return list.find((p) => p._id === id);
    }, [project?._id, projectIdProp, myProjects]);

    const projectId = (project?._id ?? projectIdProp) as Id<'projects'> | undefined;

    const initialUiState = { activeTab: 'details', actionsHeight: 0, isSaving: false };
    const [uiState, setUiState] = useState(initialUiState);

    const pagerRef = useRef<PagerTabViewRef>(null);
    const bottomSafeInset = insets.bottom || 0;
    // Calculate bottom offset for KeyboardAwareScrollView to prevent content from hiding behind sticky footer
    const bottomCompensation = uiState.actionsHeight + bottomSafeInset + BOTTOM_OFFSET_CUSHION;

    const handleNext = useCallback(async () => {
      if (uiState.activeTab === 'details') {
        setUiState((prev) => ({ ...prev, activeTab: 'team' }));
        pagerRef.current?.setPage(1);
        try {
          await Haptics.impactAsync(HAPTIC_MEDIUM);
        } catch {
          // ignore haptic errors on unsupported devices
          void 0;
        }
      }
    }, [uiState.activeTab]);

    const uiSchema = zProjectsDoc.passthrough();
    // Accept Date objects from the UI for start/end dates; backend normalization converts to ISO
    const validateSchema = zProjectsDoc
      .omit({ userId: true })
      .extend({
        startDate: z.union([z.string(), z.date()]).optional(),
        endDate: z.union([z.string(), z.date()]).optional(),
      })
      .passthrough();

    const addMyProject = useMutation(api.projects.addMyProject);
    const updateProject = useMutation(api.projects.update);
    const destroyProject = useMutation(api.projects.destroy);

    const selectedProject = project ?? (projectFromQuery as ProjectFormDoc | undefined);

    const sharedForm = useAppForm({
      defaultValues: {
        ...selectedProject,
      },
      // Relax validator typing for Date unions; runtime safeParse handles details
      validators: { onChange: validateSchema as any, onSubmit: validateSchema as any },
      onSubmit: async ({ value }) => {
        const payload = normalizeForConvex(value as Project);
        try {
          setUiState((prev) => ({ ...prev, isSaving: true }));
          const idToUpdate = selectedProject?._id ?? projectId;
          if (idToUpdate) {
            await updateProject({ id: idToUpdate, patch: payload as any });
          } else {
            await addMyProject(payload as any);
          }
          onComplete?.();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to save project';
          Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
        } finally {
          setUiState((prev) => ({ ...prev, isSaving: false }));
        }
      },
    });

    const canSubmit = useStore(sharedForm.store, (state) => state.canSubmit as boolean);
    type ProjectValues = z.infer<typeof validateSchema>;
    const formValues = useStore(sharedForm.store, (state) => state.values as ProjectValues);
    const valuesRef = useRef<ProjectValues>(formValues);
    useEffect(() => {
      valuesRef.current = formValues;
    }, [formValues]);

    useEffect(() => {
      onValidChange?.(!!canSubmit);
    }, [canSubmit, onValidChange]);

    const selectedType = useStore(sharedForm.store, (state: any) => state.values?.type) as
      | ProjectType
      | undefined;

    const metadata = useMemo(() => {
      if (!selectedType) return initialExperienceMetadata;
      return experienceMetadata[selectedType] ?? baseExperienceMetadata;
    }, [selectedType]);

    const detailsInclude = useMemo(() => {
      return selectedType ? undefined : ['type'];
    }, [selectedType]);

    const renderScene = useCallback(
      (route: TabRoute) => {
        const isDetailsTab = route.key === 'details';
        const groups = isDetailsTab ? ['details', 'basic', 'dates', 'media'] : ['team'];

        return (
          <KeyboardAwareScrollView
            style={{ flex: 1 }}
            bounces={false}
            disableScrollOnKeyboardHide
            contentInsetAdjustmentBehavior="never"
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            bottomOffset={bottomCompensation}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-4 pb-4 pt-6">
            {uiSchema && (
              <ConvexDynamicForm
                key={route.key}
                schema={uiSchema}
                metadata={metadata}
                groups={groups}
                exclude={['private']}
                debounceMs={300}
                form={sharedForm}
              />
            )}
          </KeyboardAwareScrollView>
        );
      },
      [bottomCompensation, uiSchema, metadata, sharedForm]
    );

    useImperativeHandle(ref, () => ({ submit: () => sharedForm.handleSubmit() }));

    return (
      <View className="flex-1">
        {selectedType ? (
          <PagerTabView
            ref={pagerRef}
            routes={TABS}
            renderScene={renderScene}
            initialKey="details"
            tabStyle="text"
            tabContainerClassName="border-b border-border-tint px-4"
            disabledKeys={[]}
            onIndexChange={async (index, key) => {
              const nextTab = key as 'details' | 'team';
              if (nextTab !== uiState.activeTab) {
                setUiState((prev) => ({ ...prev, activeTab: nextTab }));
              }
              try {
                await Haptics.impactAsync(HAPTIC_LIGHT);
              } catch {
                // no-op
              }
            }}
          />
        ) : (
          <View className="flex-1">
            <KeyboardAwareScrollView
              bounces={false}
              disableScrollOnKeyboardHide
              contentInsetAdjustmentBehavior="never"
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              bottomOffset={bottomCompensation}
              showsVerticalScrollIndicator={false}
              contentContainerClassName="px-4 pb-4 pt-6">
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
            </KeyboardAwareScrollView>
          </View>
        )}

        {/* Sticky footer with keyboard avoidance - moves with keyboard for better UX with form inputs */}
        {showActions && (
          <KeyboardStickyView
            offset={{
              closed: 0,
              opened: Platform.select({ ios: insets.bottom, default: insets.bottom }),
            }}>
            <View
              className="gap-2 border-t border-t-border-low px-4 pb-8 pt-4"
              onLayout={(e) => {
                // Track footer height for bottomCompensation calculation
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
                    const parsed = (validateSchema as any).safeParse(valuesRef.current);
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
              {selectedProject?._id && (
                <Button
                  variant="tertiary"
                  className="w-full"
                  onPress={() => {
                    Alert.alert(
                      'Delete Project',
                      'Are you sure you want to delete this project? This action cannot be undone.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              if (selectedProject?._id) {
                                await destroyProject({ id: selectedProject._id });
                              }
                              onComplete?.();
                            } catch (error) {
                              const errorMessage =
                                error instanceof Error ? error.message : 'Failed to delete project';
                              Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
                            }
                          },
                        },
                      ]
                    );
                  }}>
                  <Text className="text-destructive">Delete Project</Text>
                </Button>
              )}
            </View>
          </KeyboardStickyView>
        )}
      </View>
    );
  }
);
