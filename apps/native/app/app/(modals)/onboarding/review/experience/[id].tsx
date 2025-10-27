import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { ProjectEditSheet } from '~/components/projects/ProjectEditSheet';
import { type Id } from '@packages/backend/convex/_generated/dataModel';

export default function ExperienceEditModalScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [isOpen, setIsOpen] = useState(true);
  const isNew = !id || id === 'new';

  // Auto-open when mounted
  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      router.back();
    }
  };

  return (
    <ProjectEditSheet
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      projectId={isNew ? undefined : (id as Id<'projects'>)}
    />
  );
}
