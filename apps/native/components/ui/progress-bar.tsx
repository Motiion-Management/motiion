import { View } from 'react-native';

import { Text } from '~/components/ui/text';

interface ProgressBarProps {
  /**
   * The current step index (0-based)
   */
  currentStep: number;
  /**
   * Total number of steps
   */
  totalSteps: number;
  /**
   * Label to display on the left side
   */
  label: string;
}

export const ProgressBar = ({ currentStep, totalSteps, label }: ProgressBarProps) => {
  const steps = Array.from({ length: totalSteps }, (_, index) => index);

  return (
    <View className="flex-1 flex-row items-center gap-2">
      <Text variant="labelXs" color="primary" className="mr-4">
        {label}
      </Text>
      {steps.map((stepIndex) => {
        const isCurrentStep = stepIndex === currentStep;
        const isCompletedStep = stepIndex < currentStep;

        if (isCurrentStep) {
          // Current step: stretched bar
          return (
            <View key={stepIndex} className="h-1.5 w-12 rounded border-primary bg-primary-500" />
          );
        } else if (isCompletedStep) {
          // Completed step: filled dot
          return (
            <View
              key={stepIndex}
              className="size-1.5 rounded border border-primary bg-primary-500"
            />
          );
        } else {
          // Future step: empty dot
          return (
            <View
              key={stepIndex}
              className="size-1.5 rounded border border-primary bg-surface-default"
            />
          );
        }
      })}
    </View>
  );
};