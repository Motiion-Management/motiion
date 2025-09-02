import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { Text } from '~/components/ui/text';
import { ActivityIndicator } from '~/components/ui/activity-indicator';

interface StatusStep {
  id: string;
  label: string;
  completed: boolean;
  inProgress: boolean;
}

interface ResumeImportStatusProps {
  onComplete: () => void;
}

export function ResumeImportStatus({ onComplete }: ResumeImportStatusProps) {
  const [steps, setSteps] = useState<StatusStep[]>([
    { id: 'analyzing', label: 'Analyzing document details', completed: false, inProgress: true },
    {
      id: 'gathering',
      label: 'Gathering profile information',
      completed: false,
      inProgress: false,
    },
    { id: 'populating', label: 'Populating work experience', completed: false, inProgress: false },
  ]);

  useEffect(() => {
    const progressSteps = async () => {
      // Step 1: Analyzing document details (already in progress)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSteps((prev) =>
        prev.map((step) =>
          step.id === 'analyzing'
            ? { ...step, completed: true, inProgress: false }
            : step.id === 'gathering'
              ? { ...step, inProgress: true }
              : step
        )
      );

      // Step 2: Gathering profile information
      await new Promise((resolve) => setTimeout(resolve, 2500));

      setSteps((prev) =>
        prev.map((step) =>
          step.id === 'gathering'
            ? { ...step, completed: true, inProgress: false }
            : step.id === 'populating'
              ? { ...step, inProgress: true }
              : step
        )
      );

      // Step 3: Populating work experience
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSteps((prev) =>
        prev.map((step) =>
          step.id === 'populating' ? { ...step, completed: true, inProgress: false } : step
        )
      );

      // Complete after a brief pause
      await new Promise((resolve) => setTimeout(resolve, 500));
      onComplete();
    };

    progressSteps();
  }, [onComplete]);

  function StatusIndicator({ step }: { step: StatusStep }) {
    if (step.completed) {
      return (
        <View className="bg-accent-primary h-6 w-6 items-center justify-center rounded-full">
          <Text variant="caption1" className="text-background-primary font-bold">
            ✓
          </Text>
        </View>
      );
    }

    if (step.inProgress) {
      return (
        <View className="h-6 w-6 items-center justify-center">
          <ActivityIndicator size="small" />
        </View>
      );
    }

    return <View className="border-border-primary/30 h-6 w-6 rounded-full border-2" />;
  }

  return (
    <BaseOnboardingScreen
      title="Importing..."
      description="Please wait while we collect some information."
      canProgress={false}>
      <View className="flex-1 justify-center gap-8">
        {steps.map((step, index) => (
          <View
            key={step.id}
            className={`flex-row items-center gap-4 rounded-lg border-2 p-4 ${
              step.completed
                ? 'border-accent-primary bg-accent-primary/5'
                : step.inProgress
                  ? 'border-accent-primary bg-accent-primary/10'
                  : 'border-border-primary/20 bg-background-secondary'
            }`}>
            <StatusIndicator step={step} />
            <Text
              variant="body"
              className={`flex-1 ${
                step.completed
                  ? 'text-accent-primary font-medium'
                  : step.inProgress
                    ? 'text-text-primary font-medium'
                    : 'text-text-secondary'
              }`}>
              {step.label}
            </Text>
          </View>
        ))}
      </View>
    </BaseOnboardingScreen>
  );
}
