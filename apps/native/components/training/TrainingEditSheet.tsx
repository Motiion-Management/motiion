import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { Sheet } from '~/components/ui/sheet';

import { type Id } from '@packages/backend/convex/_generated/dataModel';
import { type TrainingFormDoc } from '@packages/backend/convex/validators/training';
import { TrainingEditForm } from './TrainingEditForm';

interface TrainingEditSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  training?: TrainingFormDoc;
  trainingId?: Id<'training'>;
}

type TrainingType = (typeof TRAINING_TYPES)[number];

export function TrainingEditSheet({ isOpen, onOpenChange, training, trainingId: trainingIdProp }: TrainingEditSheetProps) {
  const trainingId = training?._id ?? trainingIdProp;
  const [uiState] = useState({});
  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);
  const title = trainingId ? 'Edit Training' : 'Add Training';

  return (
    <Sheet
      enableContentPanningGesture={false}
      isOpened={isOpen}
      label={title}
      onIsOpenedChange={(open) => {
        if (open) {
          sharedForm.reset();
        }
        onOpenChange(open);
      }}>
      <View className="h-[80vh]">
        <TrainingEditForm onClose={handleClose} training={training} trainingId={trainingIdProp} />
      </View>
    </Sheet>
  );
}
