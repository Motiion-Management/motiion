import React, { useCallback, useState, useRef, useMemo, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';
import { z } from 'zod';

import { Sheet } from '~/components/ui/sheet';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { PagerTabView, type TabRoute, type PagerTabViewRef } from '~/components/ui/tabs';
import { ConvexDynamicForm } from '~/components/form/ConvexDynamicForm';
import { useAppForm } from '~/components/form/appForm';
import { useStore } from '@tanstack/react-form';
import { type Id } from '@packages/backend/convex/_generated/dataModel';
import {
  zProjectsDoc,
  type ProjectFormDoc,
  type ProjectType,
} from '@packages/backend/convex/schemas/projects';
import {
  experienceMetadata,
  baseExperienceMetadata,
  initialExperienceMetadata,
} from '~/utils/convexFormMetadata';
import { normalizeForConvex } from '~/utils/convexHelpers';
import { type Project } from '~/types/projects';

const HAPTIC_LIGHT = Haptics.ImpactFeedbackStyle.Light;
const HAPTIC_MEDIUM = Haptics.ImpactFeedbackStyle.Medium;

interface ProjectEditSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  project?: ProjectFormDoc;
  projectId?: Id<'projects'>;
}

export function ProjectEditSheet({
  isOpen,
  onOpenChange,
  project,
  projectId: projectIdProp,
}: ProjectEditSheetProps) {
  const [currentTab, setCurrentTab] = useState<'details' | 'team'>('details');
  const [isSaving, setIsSaving] = useState(false);
  const pagerRef = useRef<PagerTabViewRef>(null);

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  // Fetch project if needed
  const myProjects = useQuery(api.projects.getMyProjects, {});
  const projectFromQuery = useMemo<ProjectFormDoc | undefined>(() => {
    const id = project?._id ?? projectIdProp;
    if (!id || !Array.isArray(myProjects)) return undefined;
    const list = myProjects as unknown as ProjectFormDoc[];
    return list.find((p) => p._id === id);
  }, [project?._id, projectIdProp, myProjects]);

  const selectedProject = project ?? projectFromQuery;

  // Mutations
  const addMyProject = useMutation(api.projects.addMyProject);
  const updateProject = useMutation(api.projects.update);
  const destroyProject = useMutation(api.projects.destroy);

  // Schema
  const uiSchema = zProjectsDoc.passthrough();
  const validateSchema = zProjectsDoc
    .omit({ userId: true })
    .extend({
      startDate: z.union([z.string(), z.date()]).optional(),
      endDate: z.union([z.string(), z.date()]).optional(),
    })
    .passthrough();

  // Form
  const sharedForm = useAppForm({
    defaultValues: {
      ...selectedProject,
    },
    validators: { onChange: validateSchema as any, onSubmit: validateSchema as any },
    onSubmit: async ({ value }) => {
      const payload = normalizeForConvex(value as Project);
      try {
        setIsSaving(true);
        const idToUpdate = selectedProject?._id ?? projectIdProp;
        if (idToUpdate) {
          await updateProject({ id: idToUpdate, patch: payload as any });
        } else {
          await addMyProject(payload as any);
        }
        handleClose();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save project';
        Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
      } finally {
        setIsSaving(false);
      }
    },
  });

  // Sync form with loaded project data
  useEffect(() => {
    if (selectedProject) {
      sharedForm.update({
        defaultValues: selectedProject,
      });
    }
  }, [selectedProject, sharedForm]);

  const canSubmit = useStore(sharedForm.store, (state) => state.canSubmit as boolean);
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

  // Define tab routes
  const tabs: TabRoute[] = [
    { key: 'details', title: 'Details' },
    { key: 'team', title: 'Team' },
  ];

  // Handle Next button - updates state AND pager view
  const handleNext = useCallback(async () => {
    setCurrentTab('team');
    pagerRef.current?.setPage(1);
    try {
      await Haptics.impactAsync(HAPTIC_MEDIUM);
    } catch {
      // ignore haptic errors
    }
  }, []);

  const handleSubmit = useCallback(() => {
    const formValues = sharedForm.store.state.values;
    const parsed = (validateSchema as any).safeParse(formValues);
    if (!parsed.success) {
      const msg = parsed.error.errors?.[0]?.message || 'Please correct the highlighted fields.';
      toast.error(msg);
    }
    sharedForm.handleSubmit();
  }, [sharedForm, validateSchema]);

  const handleDelete = useCallback(async () => {
    if (!selectedProject?._id) return;
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
              await destroyProject({ id: selectedProject._id });
              handleClose();
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : 'Failed to delete project';
              Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
            }
          },
        },
      ]
    );
  }, [selectedProject, destroyProject, handleClose]);

  // Render scene for each tab
  const renderScene = useCallback(
    (route: TabRoute) => {
      if (!selectedType) {
        // Show initial type selection
        return (
          <ScrollView style={{ flex: 1 }} className="px-4 py-6">
            {uiSchema && (
              <ConvexDynamicForm
                key="details-initial"
                schema={uiSchema}
                metadata={metadata}
                groups={['details', 'basic', 'dates', 'media']}
                include={detailsInclude}
                exclude={['private']}
                debounceMs={300}
                form={sharedForm}
              />
            )}
          </ScrollView>
        );
      }

      const isDetailsTab = route.key === 'details';
      const groups = isDetailsTab ? ['details', 'basic', 'dates', 'media'] : ['team'];

      return (
        <ScrollView style={{ flex: 1 }} className="px-4 py-6">
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
        </ScrollView>
      );
    },
    [selectedType, uiSchema, metadata, detailsInclude, sharedForm]
  );

  // Determine button text and action
  const buttonText = selectedType ? (currentTab === 'details' ? 'Next' : 'Save') : 'Next';
  const buttonAction = selectedType
    ? currentTab === 'details'
      ? handleNext
      : handleSubmit
    : handleNext;
  const buttonDisabled = selectedType
    ? currentTab === 'details'
      ? false
      : isSaving || !canSubmit
    : !selectedType;

  const title = selectedProject?._id ? 'Edit Project' : 'Add Project';

  return (
    <Sheet
      enableContentPanningGesture={false}
      isOpened={isOpen}
      label={title}
      onIsOpenedChange={onOpenChange}>
      <View className="h-[80vh]">
        {selectedType ? (
          <PagerTabView
            ref={pagerRef}
            routes={tabs}
            renderScene={renderScene}
            initialKey="details"
            tabStyle="text"
            tabContainerClassName="border-b border-border-tint px-4"
            onIndexChange={async (index, key) => {
              setCurrentTab(key as 'details' | 'team');
              try {
                await Haptics.impactAsync(HAPTIC_LIGHT);
              } catch {
                // no-op
              }
            }}
          />
        ) : (
          renderScene({ key: 'details', title: 'Details' })
        )}

        {/* Bottom Actions */}
        <View className="gap-2 border-t border-border-tint px-4 pb-4 pt-4">
          <Button onPress={buttonAction} disabled={buttonDisabled} className="w-full">
            <Text variant="header5" className="text-text-high">
              {isSaving ? 'Saving...' : buttonText}
            </Text>
          </Button>
          {selectedProject?._id && (
            <Button variant="tertiary" className="w-full" onPress={handleDelete}>
              <Text className="text-destructive">Delete Project</Text>
            </Button>
          )}
        </View>
      </View>
    </Sheet>
  );
}
