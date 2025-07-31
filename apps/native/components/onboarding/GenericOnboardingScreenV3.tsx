import React from 'react';
import { View } from 'react-native';
import { z } from 'zod';
import { router } from 'expo-router';
import { BaseOnboardingScreenV3 } from '~/components/layouts/BaseOnboardingScreenV3';
import { AutoSubmitFormV3 } from '~/components/form/AutoSubmitFormV3';
import { useOnboardingFlowV3 } from '~/hooks/useOnboardingFlowV3';
import { useUser } from '~/hooks/useUser';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import { Picker, PickerItem } from '~/components/ui/select';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import { InputLabel } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { type OnboardingStepV3 } from '@packages/backend/convex/validators/onboardingFlowsV3';
import { SizingFieldV3 } from '~/components/sizing/SizingFieldV3';
import { HeadshotsFieldV3 } from '~/components/upload/HeadshotsFieldV3';
import { HeightFieldV3 } from '~/components/form/HeightFieldV3';

// Field type definitions
type FieldType = 'text' | 'select' | 'radio' | 'number' | 'email' | 'phone' | 'custom';

interface FieldConfig {
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: z.ZodSchema<any>;
  required?: boolean;
  minItems?: number;
  maxItems?: number;
  customComponent?: React.ComponentType<any>;
}

// Map of field names to their configurations
const FIELD_CONFIGS: Record<string, Partial<FieldConfig>> = {
  profileType: {
    type: 'radio',
    label: 'I am a',
    options: [
      { value: 'dancer', label: 'Dancer' },
      { value: 'choreographer', label: 'Choreographer' },
      { value: 'guest', label: 'Guest' },
    ],
    validation: z.enum(['dancer', 'choreographer', 'guest']),
  },
  height: {
    type: 'custom',
    label: 'Height',
    placeholder: 'Select your height',
    customComponent: HeightFieldV3,
    validation: z.union([
      z.string().regex(/^\d-\d+$/),
      z.object({
        feet: z.number(),
        inches: z.number(),
      }),
    ]),
  },
  ethnicity: {
    type: 'select',
    label: 'Ethnicity',
    placeholder: 'Select your ethnicity',
    options: [
      { value: 'african-american', label: 'African American' },
      { value: 'asian', label: 'Asian' },
      { value: 'caucasian', label: 'Caucasian' },
      { value: 'hispanic', label: 'Hispanic' },
      { value: 'middle-eastern', label: 'Middle Eastern' },
      { value: 'native-american', label: 'Native American' },
      { value: 'pacific-islander', label: 'Pacific Islander' },
      { value: 'mixed', label: 'Mixed' },
      { value: 'other', label: 'Other' },
    ],
    validation: z.string(),
  },
  hairColor: {
    type: 'radio',
    label: 'Hair Color',
    options: [
      { value: 'Black', label: 'Black' },
      { value: 'Blonde', label: 'Blonde' },
      { value: 'Brown', label: 'Brown' },
      { value: 'Red', label: 'Red' },
      { value: 'Other', label: 'Other' },
    ],
    validation: z.enum(['Black', 'Blonde', 'Brown', 'Red', 'Other']),
  },
  eyeColor: {
    type: 'radio',
    label: 'Eye Color',
    options: [
      { value: 'Amber', label: 'Amber' },
      { value: 'Blue', label: 'Blue' },
      { value: 'Brown', label: 'Brown' },
      { value: 'Green', label: 'Green' },
      { value: 'Gray', label: 'Gray' },
      { value: 'Mixed', label: 'Mixed' },
    ],
    validation: z.enum(['Amber', 'Blue', 'Brown', 'Green', 'Gray', 'Mixed']),
  },
  gender: {
    type: 'radio',
    label: 'Gender',
    options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'Non-binary', label: 'Non-binary' },
    ],
    validation: z.enum(['Male', 'Female', 'Non-binary']),
  },
  location: {
    type: 'text',
    label: 'Location',
    placeholder: 'Enter your city, state',
    validation: z.string().min(3),
  },
  workLocation: {
    type: 'text',
    label: 'Work Locations',
    placeholder: 'Cities where you can work',
    validation: z.string().min(3),
  },
  sizing: {
    type: 'custom',
    label: 'Sizing Information',
    customComponent: SizingFieldV3,
    validation: z.object({
      general: z
        .object({
          waist: z.string().optional(),
          inseam: z.string().optional(),
          hat: z.string().optional(),
          glove: z.string().optional(),
        })
        .optional(),
      male: z
        .object({
          shirt: z.string().optional(),
          shoes: z.string().optional(),
          chest: z.string().optional(),
          neck: z.string().optional(),
          sleeve: z.string().optional(),
          coatLength: z.string().optional(),
        })
        .optional(),
      female: z
        .object({
          dress: z.string().optional(),
          shirt: z.string().optional(),
          shoes: z.string().optional(),
          bust: z.string().optional(),
          cup: z.string().optional(),
          underbust: z.string().optional(),
          hips: z.string().optional(),
          pants: z.string().optional(),
          coatLength: z.string().optional(),
        })
        .optional(),
    }),
  },
  headshots: {
    type: 'custom',
    label: 'Headshots',
    customComponent: HeadshotsFieldV3,
    validation: z.array(z.any()).min(1).max(5),
  },
};

// Generate schema from step fields
function generateSchema(step: OnboardingStepV3): z.ZodObject<any> {
  const schemaFields: Record<string, z.ZodSchema<any>> = {};

  step.fields.forEach((field) => {
    const config = FIELD_CONFIGS[field.name];
    let fieldSchema = config?.validation || z.string();

    if (!field.required) {
      fieldSchema = fieldSchema.optional();
    }

    schemaFields[field.name] = fieldSchema;
  });

  return z.object(schemaFields);
}

// Render a form field based on configuration
function renderField(
  fieldName: string,
  fieldConfig: FieldConfig,
  value: any,
  onChange: (value: any) => void
) {
  switch (fieldConfig.type) {
    case 'text':
    case 'email':
    case 'phone':
      return (
        <Input
          placeholder={fieldConfig.placeholder}
          value={value || ''}
          onChangeText={onChange}
          keyboardType={
            fieldConfig.type === 'email'
              ? 'email-address'
              : fieldConfig.type === 'phone'
                ? 'phone-pad'
                : 'default'
          }
        />
      );

    case 'select':
      return (
        <Picker selectedValue={value} onValueChange={onChange}>
          <PickerItem label={fieldConfig.placeholder || `Select ${fieldConfig.label}`} value="" />
          {fieldConfig.options?.map((option) => (
            <PickerItem key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      );

    case 'radio':
      return (
        <RadioGroup value={value} onValueChange={onChange}>
          {fieldConfig.options?.map((option) => (
            <View key={option.value} className="mb-2 flex-row items-center space-x-2">
              <RadioGroupItem value={option.value} />
              <View className="flex-1">
                <Text onPress={() => onChange(option.value)}>{option.label}</Text>
              </View>
            </View>
          ))}
        </RadioGroup>
      );

    case 'custom':
      if (fieldConfig.customComponent) {
        const CustomComponent = fieldConfig.customComponent;
        return <CustomComponent value={value} onChange={onChange} {...fieldConfig} />;
      }
      return <Text>Custom field not implemented</Text>;

    default:
      return <Text>Unknown field type: {fieldConfig.type}</Text>;
  }
}

interface GenericOnboardingScreenV3Props {
  // Optional custom field components
  customFields?: Record<string, React.ComponentType<any>>;
  // Optional override for specific steps
  stepOverrides?: Record<string, React.ComponentType>;
}

/**
 * Generic onboarding screen that can handle any step
 * - Dynamically renders form fields based on step configuration
 * - Handles auto-submit and navigation automatically
 * - Can be customized with custom field components
 */
export function GenericOnboardingScreenV3({
  customFields,
  stepOverrides,
}: GenericOnboardingScreenV3Props = {}) {
  const flowData = useOnboardingFlowV3();

  // Early return if hook is not ready
  if (!flowData) {
    return (
      <BaseOnboardingScreenV3>
        <View className="flex-1 items-center justify-center">
          <Text>Loading...</Text>
        </View>
      </BaseOnboardingScreenV3>
    );
  }

  const { currentStep, currentStepId, isLoading } = flowData;
  const { user } = useUser();
  const [formValues, setFormValues] = React.useState<Record<string, any>>({});

  // Log for debugging
  React.useEffect(() => {
    console.log('[GenericOnboardingScreenV3] Flow data:', {
      isLoading,
      currentStepId,
      currentStep: currentStep?.id,
      flowDataKeys: Object.keys(flowData),
    });
  }, [isLoading, currentStepId, currentStep, flowData]);

  // Get default values from user profile - must be before any conditional returns
  const defaultValues = React.useMemo(() => {
    if (!currentStep) return {};

    const values: Record<string, any> = {};
    currentStep.fields.forEach((field) => {
      if (user && (user as any)[field.name]) {
        values[field.name] = (user as any)[field.name];
      }
    });
    return values;
  }, [currentStep, user]);

  // Generate schema for validation - must be before any conditional returns
  const schema = React.useMemo(() => {
    if (!currentStep) return z.object({});
    return generateSchema(currentStep);
  }, [currentStep]);

  // Check for step override
  if (currentStepId && stepOverrides?.[currentStepId]) {
    const OverrideComponent = stepOverrides[currentStepId];
    return <OverrideComponent />;
  }

  if (isLoading || !currentStep) {
    return (
      <BaseOnboardingScreenV3>
        <View className="items-center justify-center py-8">
          <Text className="text-muted-foreground">
            {isLoading ? 'Loading onboarding flow...' : 'Setting up your profile...'}
          </Text>
        </View>
      </BaseOnboardingScreenV3>
    );
  }

  return (
    <BaseOnboardingScreenV3>
      <AutoSubmitFormV3
        schema={schema}
        defaultValues={defaultValues}
        autoSubmit={currentStep.autoSubmit}
        submitDelay={currentStep.submitDelay}>
        <View className="gap-4">
          {currentStep.fields.map((field) => {
            const config = FIELD_CONFIGS[field.name];
            if (!config) {
              console.warn(`No field configuration found for: ${field.name}`);
              return null;
            }

            const fullConfig: FieldConfig = {
              name: field.name,
              type: 'text',
              label: field.name,
              required: field.required,
              minItems: field.minItems,
              maxItems: field.maxItems,
              ...config,
              customComponent: customFields?.[field.name] || config.customComponent,
            };

            return (
              <View key={field.name} className="gap-2">
                <InputLabel>{fullConfig.label}</InputLabel>
                {renderField(field.name, fullConfig, formValues[field.name], (value) =>
                  setFormValues((prev) => ({ ...prev, [field.name]: value }))
                )}
                {field.required && <Text className="text-xs text-muted-foreground">Required</Text>}
              </View>
            );
          })}
        </View>
      </AutoSubmitFormV3>
    </BaseOnboardingScreenV3>
  );
}

/**
 * Completion screen for the end of onboarding
 */
export function OnboardingCompleteScreenV3() {
  return (
    <BaseOnboardingScreenV3
      title="Welcome!"
      description="You've completed your profile setup. Let's get started!"
      showNavigation={false}>
      <View className="items-center py-8">
        <Text variant="title2" className="text-success mb-4">
          ✓ All Set!
        </Text>
        <Button
          variant="accent"
          size="lg"
          onPress={() => {
            // Navigate to main app
            router.replace('/app');
          }}>
          <Text>Get Started</Text>
        </Button>
      </View>
    </BaseOnboardingScreenV3>
  );
}
