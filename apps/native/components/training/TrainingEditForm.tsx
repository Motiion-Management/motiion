import React, { useMemo, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { View, Platform, Alert } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConvexDynamicForm } from '~/components/form/ConvexDynamicForm';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { type Id } from '@packages/backend/convex/_generated/dataModel';
import {
  type TrainingFormDoc,
  zTrainingFormDoc,
} from '@packages/backend/convex/schemas/training';
import { TRAINING_TYPES } from '@packages/backend/convex/schemas/training';
import {
  trainingMetadata,
  baseTrainingMetadata,
  initialTrainingMetadata,
} from '~/utils/convexFormMetadata';
import { useAppForm } from '~/components/form/appForm';
import { useStore } from '@tanstack/react-form';
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';

const BOTTOM_OFFSET_CUSHION = 8;

type TrainingType = (typeof TRAINING_TYPES)[number];

interface TrainingEditFormProps {
  onClose: () => void;
  training?: TrainingFormDoc;
  trainingId?: Id<'training'>;
  showActions?: boolean;
  onValidChange?: (valid: boolean) => void;
  afterSubmit?: () => void;
}

export interface TrainingEditFormHandle {
  submit: () => void;
}

export const TrainingEditForm = forwardRef<TrainingEditFormHandle, TrainingEditFormProps>(
  (
    {
      onClose,
      training,
      trainingId: trainingIdProp,
      showActions = true,
      onValidChange,
      afterSubmit,
    },
    ref
  ) => {
    const insets = useSafeAreaInsets();
    const [uiState, setUiState] = useState({ actionsHeight: 0, isSaving: false });
    const bottomSafeInset = insets.bottom || 0;
    const bottomCompensation = uiState.actionsHeight + bottomSafeInset + BOTTOM_OFFSET_CUSHION;

    // Fetch if id provided but doc not passed
    const myTraining = useQuery(api.training.getMyTraining, {});
    const trainingFromQuery = useMemo(() => {
      const id = training?._id ?? trainingIdProp;
      if (!id || !Array.isArray(myTraining)) return undefined;
      return myTraining.find((t: any) => t._id === id);
    }, [training?._id, trainingIdProp, myTraining]);

    const schema = zTrainingFormDoc;
    const addMyTraining = useMutation(api.training.addMyTraining);
    const updateTraining = useMutation(api.training.update);

    const selectedTraining = training ?? (trainingFromQuery as TrainingFormDoc | undefined);

    const sharedForm = useAppForm({
      defaultValues: selectedTraining,
      validators: { onChange: schema as any },
      onSubmit: async ({ value }) => {
        const { _id, _creationTime, ...payload } = value;
        try {
          setUiState((prev) => ({ ...prev, isSaving: true }));
          const idToUpdate = selectedTraining?._id ?? trainingIdProp;
          if (idToUpdate) {
            await updateTraining({ id: idToUpdate, patch: payload });
          } else {
            await addMyTraining(payload);
          }
          sharedForm.reset();
          if (afterSubmit) afterSubmit();
          else onClose();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to save training';
          console.error('Failed to save training:', error);
          Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
        } finally {
          setUiState((prev) => ({ ...prev, isSaving: false }));
        }
      },
    });

    const canSubmit = useStore(
      sharedForm.store,
      (state) => state.canSubmit && (state.isDirty || trainingIdProp)
    );

    useEffect(() => {
      onValidChange?.(!!canSubmit);
    }, [canSubmit, onValidChange]);
    const selectedType = useStore(sharedForm.store, (state) => state.values?.type) as
      | TrainingType
      | undefined;

    const metadata = useMemo(() => {
      if (!selectedType) return initialTrainingMetadata;
      return trainingMetadata[selectedType] ?? baseTrainingMetadata;
    }, [selectedType]);

    const detailsInclude = useMemo(() => {
      return selectedType ? undefined : ['type'];
    }, [selectedType]);

    useImperativeHandle(ref, () => ({ submit: () => sharedForm.handleSubmit() }));

    return (
      <View className="flex-1">
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

        {showActions && (
          <KeyboardStickyView
            offset={{
              closed: 0,
              opened: Platform.select({ ios: insets.bottom, default: insets.bottom }),
            }}>
            <View
              className="gap-2 border-t border-t-border-low bg-surface-default px-4 pb-8 pt-4"
              onLayout={(e) => {
                const height = e.nativeEvent?.layout?.height ?? 0;
                setUiState((prev) => ({ ...prev, actionsHeight: height }));
              }}>
              <Button
                onPress={sharedForm.handleSubmit}
                disabled={uiState.isSaving || !canSubmit}
                className="w-full">
                <Text>{uiState.isSaving ? 'Saving…' : 'Save'}</Text>
              </Button>
            </View>
          </KeyboardStickyView>
        )}
      </View>
    );
  }
);
