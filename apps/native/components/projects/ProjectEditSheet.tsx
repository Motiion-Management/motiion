import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Sheet } from '~/components/ui/sheet';
import { type Id } from '@packages/backend/convex/_generated/dataModel';
import { type ProjectFormDoc } from '@packages/backend/convex/validators/projects';
import { ProjectEditForm } from './ProjectEditForm';

interface ProjectEditSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ProjectFormDoc;
  projectId?: Id<'projects'>;
}

export function ProjectEditSheet({ isOpen, onOpenChange, project, projectId }: ProjectEditSheetProps) {
  const handleComplete = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange} modal>
      <Sheet.Content side="bottom" className="h-[90%]">
        <View className="h-full">
          <ProjectEditForm
            project={project}
            projectId={projectId}
            onComplete={handleComplete}
          />
        </View>
      </Sheet.Content>
    </Sheet>
  );
}

// Backward compatibility export
export { ProjectEditSheet as ExperienceEditSheet };