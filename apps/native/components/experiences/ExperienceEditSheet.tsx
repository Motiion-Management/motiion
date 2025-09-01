import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Sheet } from '~/components/ui/sheet';
import { type Id } from '@packages/backend/convex/_generated/dataModel';
import { type ExperienceFormDoc } from '@packages/backend/convex/validators/experiences';
import { ExperienceEditForm } from './ExperienceEditForm';

interface ExperienceEditSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  // Prefer passing the whole experience to avoid refetching
  experience?: ExperienceFormDoc;
  experienceId?: Id<'experiences'>;
}

export function ExperienceEditSheet({ isOpen, onOpenChange, experience, experienceId: experienceIdProp }: ExperienceEditSheetProps) {
  const experienceId = experience?._id ?? experienceIdProp
  const title = experienceId ? 'Edit Experience' : 'Add Experience'
  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange])

  return (
    <Sheet
      enableContentPanningGesture={false}
      isOpened={isOpen}
      label={title}
      onIsOpenedChange={(open) => {
        onOpenChange(open);
      }}>
      <View className="h-[80vh]">
        <ExperienceEditForm
          key={`${experience?._id ?? experienceIdProp ?? 'new'}-${isOpen ? 'open' : 'closed'}`}
          onClose={handleClose}
          experience={experience}
          experienceId={experienceIdProp}
        />
      </View>
    </Sheet>
  );
}
