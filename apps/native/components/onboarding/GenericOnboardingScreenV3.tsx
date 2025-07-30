import React from 'react'
import { View } from 'react-native'
import { z } from 'zod'
import { router } from 'expo-router'
import { BaseOnboardingScreenV3 } from '~/components/layouts/BaseOnboardingScreenV3'
import { AutoSubmitFormV3 } from '~/components/form/AutoSubmitFormV3'
import { useOnboardingFlowV3 } from '~/hooks/useOnboardingFlowV3'
import { useUser } from '~/hooks/useUser'
import { Text } from '~/components/ui/text'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import { Label } from '~/components/ui/label'
import { Button } from '~/components/ui/button'
import { type OnboardingStepV3 } from '@packages/backend/convex/validators/onboardingFlowsV3'

// Field type definitions
type FieldType = 'text' | 'select' | 'radio' | 'number' | 'email' | 'phone' | 'custom'

interface FieldConfig {
  name: string
  type: FieldType
  label: string
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  validation?: z.ZodSchema<any>
  required?: boolean
  minItems?: number
  maxItems?: number
  customComponent?: React.ComponentType<any>
}

// Map of field names to their configurations
const FIELD_CONFIGS: Record<string, Partial<FieldConfig>> = {
  profileType: {
    type: 'radio',
    label: 'I am a',
    options: [
      { value: 'dancer', label: 'Dancer' },
      { value: 'choreographer', label: 'Choreographer' },
      { value: 'guest', label: 'Guest' }
    ],
    validation: z.enum(['dancer', 'choreographer', 'guest'])
  },
  height: {
    type: 'select',
    label: 'Height',
    placeholder: 'Select your height',
    options: [
      { value: '4-0', label: "4'0\"" },
      { value: '4-1', label: "4'1\"" },
      { value: '4-2', label: "4'2\"" },
      { value: '4-3', label: "4'3\"" },
      { value: '4-4', label: "4'4\"" },
      { value: '4-5', label: "4'5\"" },
      { value: '4-6', label: "4'6\"" },
      { value: '4-7', label: "4'7\"" },
      { value: '4-8', label: "4'8\"" },
      { value: '4-9', label: "4'9\"" },
      { value: '4-10', label: "4'10\"" },
      { value: '4-11', label: "4'11\"" },
      { value: '5-0', label: "5'0\"" },
      { value: '5-1', label: "5'1\"" },
      { value: '5-2', label: "5'2\"" },
      { value: '5-3', label: "5'3\"" },
      { value: '5-4', label: "5'4\"" },
      { value: '5-5', label: "5'5\"" },
      { value: '5-6', label: "5'6\"" },
      { value: '5-7', label: "5'7\"" },
      { value: '5-8', label: "5'8\"" },
      { value: '5-9', label: "5'9\"" },
      { value: '5-10', label: "5'10\"" },
      { value: '5-11', label: "5'11\"" },
      { value: '6-0', label: "6'0\"" },
      { value: '6-1', label: "6'1\"" },
      { value: '6-2', label: "6'2\"" },
      { value: '6-3', label: "6'3\"" },
      { value: '6-4', label: "6'4\"" },
      { value: '6-5', label: "6'5\"" },
      { value: '6-6', label: "6'6\"" }
    ],
    validation: z.string().regex(/^\d-\d+$/)
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
      { value: 'other', label: 'Other' }
    ],
    validation: z.string()
  },
  hairColor: {
    type: 'select',
    label: 'Hair Color',
    placeholder: 'Select your hair color',
    options: [
      { value: 'black', label: 'Black' },
      { value: 'brown', label: 'Brown' },
      { value: 'blonde', label: 'Blonde' },
      { value: 'red', label: 'Red' },
      { value: 'auburn', label: 'Auburn' },
      { value: 'gray', label: 'Gray' },
      { value: 'white', label: 'White' },
      { value: 'other', label: 'Other' }
    ],
    validation: z.string()
  },
  eyeColor: {
    type: 'select',
    label: 'Eye Color',
    placeholder: 'Select your eye color',
    options: [
      { value: 'brown', label: 'Brown' },
      { value: 'blue', label: 'Blue' },
      { value: 'green', label: 'Green' },
      { value: 'hazel', label: 'Hazel' },
      { value: 'gray', label: 'Gray' },
      { value: 'amber', label: 'Amber' },
      { value: 'other', label: 'Other' }
    ],
    validation: z.string()
  },
  gender: {
    type: 'radio',
    label: 'Gender',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'non-binary', label: 'Non-binary' },
      { value: 'prefer-not-to-say', label: 'Prefer not to say' }
    ],
    validation: z.string()
  },
  location: {
    type: 'text',
    label: 'Location',
    placeholder: 'Enter your city, state',
    validation: z.string().min(3)
  },
  workLocation: {
    type: 'text',
    label: 'Work Locations',
    placeholder: 'Cities where you can work',
    validation: z.string().min(3)
  }
}

// Generate schema from step fields
function generateSchema(step: OnboardingStepV3): z.ZodObject<any> {
  const schemaFields: Record<string, z.ZodSchema<any>> = {}
  
  step.fields.forEach(field => {
    const config = FIELD_CONFIGS[field.name]
    let fieldSchema = config?.validation || z.string()
    
    if (!field.required) {
      fieldSchema = fieldSchema.optional()
    }
    
    schemaFields[field.name] = fieldSchema
  })
  
  return z.object(schemaFields)
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
            fieldConfig.type === 'email' ? 'email-address' :
            fieldConfig.type === 'phone' ? 'phone-pad' : 'default'
          }
        />
      )
    
    case 'select':
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={fieldConfig.placeholder || `Select ${fieldConfig.label}`} />
          </SelectTrigger>
          <SelectContent>
            {fieldConfig.options?.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    
    case 'radio':
      return (
        <RadioGroup value={value} onValueChange={onChange}>
          {fieldConfig.options?.map(option => (
            <View key={option.value} className="flex-row items-center space-x-2 mb-2">
              <RadioGroupItem value={option.value} />
              <Label className="flex-1" onPress={() => onChange(option.value)}>
                {option.label}
              </Label>
            </View>
          ))}
        </RadioGroup>
      )
    
    case 'custom':
      if (fieldConfig.customComponent) {
        const CustomComponent = fieldConfig.customComponent
        return <CustomComponent value={value} onChange={onChange} {...fieldConfig} />
      }
      return <Text>Custom field not implemented</Text>
    
    default:
      return <Text>Unknown field type: {fieldConfig.type}</Text>
  }
}

interface GenericOnboardingScreenV3Props {
  // Optional custom field components
  customFields?: Record<string, React.ComponentType<any>>
  // Optional override for specific steps
  stepOverrides?: Record<string, React.ComponentType>
}

/**
 * Generic onboarding screen that can handle any step
 * - Dynamically renders form fields based on step configuration
 * - Handles auto-submit and navigation automatically
 * - Can be customized with custom field components
 */
export function GenericOnboardingScreenV3({
  customFields,
  stepOverrides
}: GenericOnboardingScreenV3Props = {}) {
  const { currentStep, currentStepId } = useOnboardingFlowV3()
  const { user } = useUser()
  const [formValues, setFormValues] = React.useState<Record<string, any>>({})
  
  // Check for step override
  if (currentStepId && stepOverrides?.[currentStepId]) {
    const OverrideComponent = stepOverrides[currentStepId]
    return <OverrideComponent />
  }
  
  if (!currentStep) {
    return (
      <BaseOnboardingScreenV3>
        <Text>Loading step...</Text>
      </BaseOnboardingScreenV3>
    )
  }
  
  // Generate schema for validation
  const schema = generateSchema(currentStep)
  
  // Get default values from user profile
  const defaultValues = React.useMemo(() => {
    const values: Record<string, any> = {}
    currentStep.fields.forEach(field => {
      if (user && (user as any)[field.name]) {
        values[field.name] = (user as any)[field.name]
      }
    })
    return values
  }, [currentStep, user])
  
  return (
    <BaseOnboardingScreenV3>
      <AutoSubmitFormV3
        schema={schema}
        defaultValues={defaultValues}
        autoSubmit={currentStep.autoSubmit}
        submitDelay={currentStep.submitDelay}
      >
        <View className="gap-4">
          {currentStep.fields.map(field => {
            const config = FIELD_CONFIGS[field.name]
            if (!config) {
              console.warn(`No field configuration found for: ${field.name}`)
              return null
            }
            
            const fullConfig: FieldConfig = {
              name: field.name,
              type: 'text',
              label: field.name,
              required: field.required,
              minItems: field.minItems,
              maxItems: field.maxItems,
              ...config,
              customComponent: customFields?.[field.name] || config.customComponent
            }
            
            return (
              <View key={field.name} className="gap-2">
                <Label>{fullConfig.label}</Label>
                {renderField(
                  field.name,
                  fullConfig,
                  formValues[field.name],
                  (value) => setFormValues(prev => ({ ...prev, [field.name]: value }))
                )}
                {field.required && (
                  <Text className="text-xs text-muted-foreground">Required</Text>
                )}
              </View>
            )
          })}
        </View>
      </AutoSubmitFormV3>
    </BaseOnboardingScreenV3>
  )
}

/**
 * Completion screen for the end of onboarding
 */
export function OnboardingCompleteScreenV3() {
  return (
    <BaseOnboardingScreenV3
      title="Welcome!"
      description="You've completed your profile setup. Let's get started!"
      showNavigation={false}
    >
      <View className="items-center py-8">
        <Text variant="title2" className="text-success mb-4">
          ✓ All Set!
        </Text>
        <Button
          variant="accent"
          size="lg"
          onPress={() => {
            // Navigate to main app
            router.replace('/app')
          }}
        >
          <Text>Get Started</Text>
        </Button>
      </View>
    </BaseOnboardingScreenV3>
  )
}