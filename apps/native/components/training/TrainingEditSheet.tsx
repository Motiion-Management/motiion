import React, { useState, useCallback, useMemo } from 'react';
import { View, Platform, Alert } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConvexDynamicForm } from '~/components/form/ConvexDynamicForm';
import { Button } from '~/components/ui/button';
import { Sheet } from '~/components/ui/sheet';
import { Text } from '~/components/ui/text';

import { type Id } from '@packages/backend/convex/_generated/dataModel';
import { type TrainingFormDoc } from '@packages/backend/convex/validators/training';
import { TRAINING_TYPES } from '@packages/backend/convex/validators/training';
import {
  trainingMetadata,
  baseTrainingMetadata,
  initialTrainingMetadata,
} from '~/utils/convexFormMetadata';
import { useAppForm } from '~/components/form/appForm';
import { useStore } from '@tanstack/react-form';
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation } from 'convex/react';

import { zTrainingFormDoc } from '@packages/backend/convex/validators/training';

// Constants
const BOTTOM_OFFSET_CUSHION = 8;

interface TrainingEditSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  training?: TrainingFormDoc;
  trainingId?: Id<'training'>;
}

type TrainingType = (typeof TRAINING_TYPES)[number];

export function TrainingEditSheet({
  isOpen,
  onOpenChange,
  training,
  trainingId: trainingIdProp,
}: TrainingEditSheetProps) {
  const trainingId = training?._id ?? trainingIdProp;
  const insets = useSafeAreaInsets();

  // Combined UI state for better management
  const [uiState, setUiState] = useState({
    actionsHeight: 0,
    isSaving: false,
  });

  const bottomSafeInset = insets.bottom || 0;
  const bottomCompensation = uiState.actionsHeight + bottomSafeInset + BOTTOM_OFFSET_CUSHION;

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const title = trainingId ? 'Edit Training' : 'Add Training';

  // Use shared backend validator schema for single source of truth
  const schema = zTrainingFormDoc;

  // Initialize shared form controller with onSubmit handling
  const addMyTraining = useMutation(api.training.addMyTraining);
  const updateTraining = useMutation(api.training.update);

  const sharedForm = useAppForm({
    defaultValues: training,
    validators: {
      onChange: schema,
    },
    onSubmit: async ({ value }) => {
      console.log('Submitting training:', value);
      // normalizeForConvex strips system fields (_id, _creationTime)
      const { _id, _creationTime, ...payload } = value;
      try {
        setUiState((prev) => ({ ...prev, isSaving: true }));
        const idToUpdate = training?._id ?? trainingId;
        if (idToUpdate) {
          await updateTraining({ id: idToUpdate, patch: payload });
        } else {
          await addMyTraining(payload);
        }
        // Reset via form controller and close
        sharedForm.reset();
        handleClose();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save training';
        console.error('Failed to save training:', error);
        Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
      } finally {
        setUiState((prev) => ({ ...prev, isSaving: false }));
      }
    },
  });

  const canSubmit = useStore(sharedForm.store, (state) => state.canSubmit && state.isDirty);
  // Track current selected type from the form store to drive UI
  const selectedType = useStore(sharedForm.store, (state) => state.values?.type) as
    | TrainingType
    | undefined;

  const metadata = useMemo(() => {
    // Before type is chosen, show initial fields but keep all except type disabled
    if (!selectedType) return initialTrainingMetadata;
    return trainingMetadata[selectedType] ?? baseTrainingMetadata;
  }, [selectedType]);

  // When no type is selected, only show the type field
  const detailsInclude = useMemo(() => {
    // Before selecting a type, show only the type selector
    return selectedType ? undefined : ['type'];
  }, [selectedType]);

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
        {/* Single page content - no tabs needed */}
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
                {schema && (
                  <ConvexDynamicForm
                    key={`details-${selectedType || 'initial'}`}
                    schema={schema}
                    metadata={metadata}
                    groups={['details']}
                    include={detailsInclude}
                    exclude={[]}
                    debounceMs={300}
                    form={sharedForm}
                  />
                )}
              </View>
            </View>
          </KeyboardAwareScrollView>
        </View>

        {/* Actions */}
        <KeyboardStickyView
          offset={{
            closed: 0,
            opened: Platform.select({ ios: insets.bottom, default: insets.bottom }),
          }}>
          <View
            className="gap-2 border-t border-t-border-low bg-surface-default px-4 pb-8 pt-4"
            onLayout={(e) =>
              setUiState((prev) => ({ ...prev, actionsHeight: e.nativeEvent.layout.height }))
            }>
            <Button
              onPress={sharedForm.handleSubmit}
              disabled={uiState.isSaving || !canSubmit}
              className="w-full">
              <Text>{uiState.isSaving ? 'Saving…' : 'Save'}</Text>
            </Button>
          </View>
        </KeyboardStickyView>
      </View>
    </Sheet>
  );
}
