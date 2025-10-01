import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Sheet } from '~/components/ui/sheet';
import { type Id } from '@packages/backend/convex/_generated/dataModel';
import { type ProjectFormDoc } from '@packages/backend/convex/schemas/projects';
import { ProjectEditForm } from './ProjectEditForm';

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
  projectId,
}: ProjectEditSheetProps) {
  const handleComplete = useCallback(() => onOpenChange(false), [onOpenChange]);
  const title = project?._id ? 'Edit Project' : 'Add Project';

  return (
    <Sheet
      enableContentPanningGesture={false}
      isOpened={isOpen}
      label={title}
      onIsOpenedChange={(open) => onOpenChange(open)}>
      <View className="h-[80vh]">
        <ProjectEditForm project={project} projectId={projectId} onComplete={handleComplete} />
      </View>
    </Sheet>
  );
}
