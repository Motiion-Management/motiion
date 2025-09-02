import React, { useMemo, useCallback } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { type Id } from '@packages/backend/convex/_generated/dataModel';
import { z } from 'zod';
import { toast } from '~/components/ui/toast';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { type ProjectFormDoc } from '@packages/backend/convex/validators/projects';
import { useAppForm } from '~/hooks/useAppForm';
import { normalizeForConvex } from '~/utils/convexHelpers';
import { type Project } from '~/types/projects';

interface ProjectEditFormProps {
  project?: ProjectFormDoc;
  projectId?: Id<'projects'>;
  onComplete?: () => void;
}

export function ProjectEditForm({ project, projectId, onComplete }: ProjectEditFormProps) {
  const myProjects = useQuery(api.users.projects.getMyProjects, {});
  
  const projectFromQuery = useMemo<ProjectFormDoc | undefined>(() => {
    if (!myProjects || !projectId) return undefined;
    const list = myProjects as unknown as ProjectFormDoc[];
    return list.find((p) => p._id === projectId);
  }, [myProjects, projectId]);

  const validateSchema = z
    .object({
      type: z.string(),
      title: z.string().optional(),
      startDate: z.union([z.string(), z.date()]).optional(),
      endDate: z.union([z.string(), z.date()]).optional(),
    })
    .passthrough();

  const addMyProject = useMutation(api.users.projects.addMyProject);
  const updateProject = useMutation(api.projects.update);
  const destroyProject = useMutation(api.projects.destroy);

  const selectedProject = project ?? (projectFromQuery as ProjectFormDoc | undefined);

  const sharedForm = useAppForm({
    defaultValues: {
      ...selectedProject,
    },
    validators: { onChange: validateSchema, onSubmit: validateSchema },
    onSubmit: async ({ value }) => {
      console.log('Submitting project form with value:', value);
      const payload = normalizeForConvex(value as Project);
      try {
        if (selectedProject?._id) {
          await updateProject({ _id: selectedProject._id, ...payload });
          toast.success('Project updated!');
        } else {
          await addMyProject(payload);
          toast.success('Project added!');
        }
        onComplete?.();
      } catch (error) {
        console.error('Error saving project:', error);
        toast.error('Failed to save project');
      }
    },
  });

  const handleDelete = useCallback(async () => {
    if (!selectedProject?._id) return;
    try {
      await destroyProject({ _id: selectedProject._id });
      toast.success('Project deleted!');
      onComplete?.();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  }, [selectedProject, destroyProject, onComplete]);

  if (!sharedForm) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4">
      <View className="mb-4">
        <Text variant="heading">Edit Project</Text>
      </View>
      
      {/* Form fields would go here - simplified for now */}
      <View className="mb-4">
        <Text>Project editing form fields will be rendered here</Text>
      </View>

      <View className="flex-row gap-2">
        <Button onPress={sharedForm.handleSubmit} className="flex-1">
          <Text>Save</Text>
        </Button>
        {selectedProject?._id && (
          <Button variant="destructive" onPress={handleDelete}>
            <Text>Delete</Text>
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

// Backward compatibility export
export { ProjectEditForm as ExperienceEditForm };