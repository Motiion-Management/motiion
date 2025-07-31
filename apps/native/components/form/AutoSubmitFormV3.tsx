import React, { useEffect, useRef, useCallback, ReactNode } from 'react';
import { View } from 'react-native';
import { useForm, FormProvider, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { useOnboardingFlowV3, useDecisionNavigation } from '~/hooks/useOnboardingFlowV3';
import { useDebounce } from '~/hooks/useDebounce';
import { CheckCircle2, Loader2 } from 'lucide-react-native';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';

interface AutoSubmitFormV3Props<T extends Record<string, any> = Record<string, any>> {
  children: ReactNode;
  schema?: z.ZodSchema<T>;
  defaultValues?: Partial<T>;
  onSubmit?: (data: T) => Promise<void> | void;
  className?: string;
  showSaveIndicator?: boolean;
  // Override auto-submit behavior
  autoSubmit?: boolean;
  submitDelay?: number;
  // Custom navigation handler (for decision steps)
  onNavigate?: (data: T) => void;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Auto-submit form wrapper for V3 onboarding flow
 * - Automatically saves and navigates when form is valid
 * - Handles decision-based navigation
 * - Shows save state indicators
 */
export function AutoSubmitFormV3<T extends Record<string, any> = Record<string, any>>({
  children,
  schema,
  defaultValues,
  onSubmit,
  className,
  showSaveIndicator = true,
  autoSubmit: autoSubmitOverride,
  submitDelay: submitDelayOverride,
  onNavigate,
}: AutoSubmitFormV3Props<T>) {
  const { currentStep, navigateNext, flow } = useOnboardingFlowV3();
  const { navigateBasedOnDecision, decisionField } = useDecisionNavigation(currentStep, flow);
  const updateUser = useMutation(api.users.updateMyUser);

  const [saveState, setSaveState] = React.useState<SaveState>('idle');
  const saveTimeoutRef = useRef<number | undefined>(undefined);
  const lastSavedDataRef = useRef<string>('');

  // Form configuration
  const form = useForm<T>({
    defaultValues: defaultValues as any,
    resolver: schema ? zodResolver(schema as any) : undefined,
    mode: 'onChange', // Validate on every change for auto-submit
  });

  const {
    watch,
    formState: { isValid, isDirty },
  } = form;

  // Watch all form values
  const formValues = watch();

  // Determine auto-submit settings
  const shouldAutoSubmit = autoSubmitOverride ?? currentStep?.autoSubmit ?? true;
  const submitDelay = submitDelayOverride ?? currentStep?.submitDelay ?? 800;

  // Debounced form values for auto-submit
  const debouncedValues = useDebounce(formValues, submitDelay);

  // Auto-submit handler
  const handleAutoSubmit = useCallback(
    async (data: T) => {
      // Check if data has actually changed
      const dataString = JSON.stringify(data);
      if (dataString === lastSavedDataRef.current) {
        return;
      }

      try {
        setSaveState('saving');

        // Clear any existing timeout
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        // Save to backend
        if (onSubmit) {
          await onSubmit(data);
        } else {
          // Default: save to user profile
          await updateUser(data as any);
        }

        lastSavedDataRef.current = dataString;
        setSaveState('saved');

        // Show saved state briefly
        saveTimeoutRef.current = setTimeout(() => {
          setSaveState('idle');
        }, 2000);

        // Handle navigation
        if (onNavigate) {
          onNavigate(data);
        } else if (currentStep?.type === 'decision' && decisionField) {
          // For decision steps, navigate based on the decision field value
          const decisionValue = (data as any)[decisionField];
          if (decisionValue) {
            navigateBasedOnDecision(decisionValue);
          }
        } else {
          // For simple steps, just go to next
          navigateNext();
        }
      } catch (error) {
        console.error('Auto-submit error:', error);
        setSaveState('error');
        saveTimeoutRef.current = setTimeout(() => {
          setSaveState('idle');
        }, 3000);
      }
    },
    [
      onSubmit,
      updateUser,
      onNavigate,
      currentStep,
      decisionField,
      navigateBasedOnDecision,
      navigateNext,
    ]
  );

  // Auto-submit effect
  useEffect(() => {
    if (!shouldAutoSubmit || !isValid || !isDirty) {
      return;
    }

    handleAutoSubmit(debouncedValues);
  }, [debouncedValues, shouldAutoSubmit, isValid, isDirty, handleAutoSubmit]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <FormProvider {...form}>
      <View className={cn('relative', className)}>
        {children}

        {/* Save state indicator */}
        {showSaveIndicator && saveState !== 'idle' && (
          <View className="absolute right-0 top-0 flex-row items-center gap-2 rounded-full bg-background px-3 py-1 shadow-sm">
            {saveState === 'saving' && (
              <>
                <Loader2 size={16} className="animate-spin text-muted-foreground" />
                <Text className="text-sm text-muted-foreground">Saving...</Text>
              </>
            )}
            {saveState === 'saved' && (
              <>
                <CheckCircle2 size={16} className="text-success" />
                <Text className="text-success text-sm">Saved</Text>
              </>
            )}
            {saveState === 'error' && <Text className="text-sm text-destructive">Save failed</Text>}
          </View>
        )}
      </View>
    </FormProvider>
  );
}

/**
 * Hook to access the auto-submit form context
 */
export function useAutoSubmitForm<T extends Record<string, any> = Record<string, any>>() {
  const form = useForm<T>();
  const { currentStep } = useOnboardingFlowV3();

  const submitForm = useCallback(async () => {
    await form.handleSubmit((data) => {
      // This will be handled by the AutoSubmitFormV3 component
      console.log('Manual submit:', data);
    })();
  }, [form]);

  return {
    ...form,
    submitForm,
    isAutoSubmitEnabled: currentStep?.autoSubmit ?? true,
    fields: currentStep?.fields ?? [],
  };
}
