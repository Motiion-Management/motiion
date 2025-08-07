import React from 'react'
import { View, ScrollView } from 'react-native'
import { z } from 'zod'
import { ConvexDynamicForm } from '~/components/form/ConvexDynamicForm'
import { Text } from '~/components/ui/text'
import { userAttributeMetadata } from '~/utils/convexFormMetadata'

// Import the actual Convex validator for user attributes
import { attributesPlainObject } from '@packages/backend/convex/validators/attributes'

// Create a Zod schema from the Convex validator
// This is the actual schema used in your backend!
const userAttributesSchema = z.object(attributesPlainObject)

interface DynamicFormExampleProps {
  initialData?: any
  onChange?: (data: any) => void
}

/**
 * Example demonstrating dynamic form generation from Convex schemas
 */
export function DynamicFormExample({ 
  initialData = {},
  onChange 
}: DynamicFormExampleProps) {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        <Text variant="heading" className="text-2xl mb-4">
          User Attributes Form
        </Text>
        
        <Text className="text-text-disabled mb-6">
          This form is automatically generated from the Convex backend schema,
          ensuring perfect type safety and consistency between frontend and backend.
        </Text>

        <ConvexDynamicForm
          schema={userAttributesSchema}
          metadata={userAttributeMetadata}
          initialData={initialData}
          onChange={onChange}
          debounceMs={500}
        />

        <View className="mt-8 p-4 bg-surface-high rounded-lg">
          <Text variant="footnote" className="text-text-disabled">
            ✨ This entire form was generated from:
          </Text>
          <Text variant="footnote" className="text-text-disabled mt-2">
            • Convex Zod schema (backend/convex/validators/attributes.ts)
          </Text>
          <Text variant="footnote" className="text-text-disabled">
            • UI metadata configuration (utils/convexFormMetadata.ts)
          </Text>
          <Text variant="footnote" className="text-text-disabled mt-2">
            No manual form components needed! 🎉
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

/**
 * Example showing how easy it is to create a form for ANY Convex schema
 */
export function QuickFormExample() {
  // Define a schema on the fly
  const quickSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    age: z.number().min(18, 'Must be 18+'),
    interests: z.array(z.string()),
    subscribe: z.boolean().optional()
  })

  // Add some UI hints
  const quickMetadata = {
    name: { placeholder: 'Enter your full name' },
    email: { placeholder: 'your@email.com' },
    age: { placeholder: 'Your age' },
    interests: { 
      component: 'chips' as const,
      placeholder: 'Add interests',
      helpText: 'Press enter to add'
    },
    subscribe: { label: 'Subscribe to newsletter' }
  }

  return (
    <View className="p-4">
      <Text variant="heading" className="text-xl mb-4">
        Quick Form Example
      </Text>
      
      <ConvexDynamicForm
        schema={quickSchema}
        metadata={quickMetadata}
        onChange={(data) => console.log('Form data:', data)}
      />
    </View>
  )
}