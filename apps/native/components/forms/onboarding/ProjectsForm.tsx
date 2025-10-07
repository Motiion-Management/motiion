import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import { View } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { ProjectCard } from '~/components/projects/ProjectCard';
import type { FormHandle, FormProps } from './contracts';

interface ProjectsFormValues {
  // Projects are managed by the ProjectCard component itself
  // This is a placeholder to satisfy the form contract
  projects?: any[];
}

export const ProjectsForm = forwardRef<FormHandle, FormProps<ProjectsFormValues>>(
  ({ onSubmit, onValidChange }, ref) => {
    const experiences = useQuery(api.projects.getMyProjects, {});

    const slots = useMemo(() => {
      const docs = experiences || [];
      return [docs[0] || null, docs[1] || null, docs[2] || null] as (any | null)[];
    }, [experiences]);

    const firstEmptyIndex = useMemo(() => slots.findIndex((s) => !s), [slots]);

    // Projects form is always valid (can skip with no projects)
    React.useEffect(() => {
      onValidChange?.(true);
    }, [onValidChange]);

    useImperativeHandle(ref, () => ({
      submit: async () => {
        // Projects are saved automatically via ProjectCard
        // Just trigger navigation
        await onSubmit({ projects: experiences || [] });
      },
      isDirty: () => false, // Projects are managed via their own cards
      isValid: () => true, // Projects are optional
    }));

    return (
      <View className="flex-1 gap-4">
        {slots.map((proj, index) => {
          const isCompleted = !!proj;
          const isDisabled = !proj && firstEmptyIndex !== -1 && index !== firstEmptyIndex;
          const variant: 'completed' | 'default' | 'disabled' = isCompleted
            ? 'completed'
            : isDisabled
              ? 'disabled'
              : 'default';
          return (
            <ProjectCard
              key={proj?._id ?? `slot-${index}`}
              project={proj || undefined}
              projectId={proj?._id}
              placeholder={`Project ${index + 1}`}
              variant={variant}
              disabled={isDisabled}
            />
          );
        })}
      </View>
    );
  }
);

ProjectsForm.displayName = 'ProjectsForm';
