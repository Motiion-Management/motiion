import React from 'react'
import { View } from 'react-native'
import { FormFieldConfig } from '~/utils/convexSchemaToForm'
import { Text } from '~/components/ui/text'

interface ConvexFormFieldProps {
  field: FormFieldConfig
  form: any // TanStack form instance
}

/**
 * Dynamically renders the appropriate form component based on field configuration
 */
export function ConvexFormField({ field, form }: ConvexFormFieldProps) {
  // Skip certain system fields
  if (field.name === 'userId' || field.name === 'private') {
    return null
  }

  switch (field.type) {
    case 'text':
    case 'email':
      return (
        <form.AppField
          name={field.name}
          children={(fieldApi: any) => (
            <fieldApi.TextInput
              label={field.label}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              keyboardType={field.type === 'email' ? 'email-address' : 'default'}
              autoCapitalize={field.type === 'email' ? 'none' : 'sentences'}
            />
          )}
        />
      )

    case 'number':
      return (
        <form.AppField
          name={field.name}
          children={(fieldApi: any) => (
            <fieldApi.TextInput
              label={field.label}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              keyboardType="numeric"
            />
          )}
        />
      )

    case 'select':
      return (
        <form.AppField
          name={field.name}
          children={(fieldApi: any) => (
            <fieldApi.SelectField
              label={field.label}
              placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
              options={field.options || []}
            />
          )}
        />
      )

    case 'radio':
      return (
        <form.AppField
          name={field.name}
          children={(fieldApi: any) => (
            <fieldApi.RadioGroupField
              label={field.label}
              options={field.options || []}
            />
          )}
        />
      )

    case 'multiselect':
    case 'chips':
      return (
        <form.AppField
          name={field.name}
          children={(fieldApi: any) => (
            <fieldApi.ChipsField
              label={field.label}
              placeholder={field.placeholder || `Add ${field.label.toLowerCase()}`}
              helpText={field.helpText}
            />
          )}
        />
      )

    case 'checkbox':
      return (
        <form.AppField
          name={field.name}
          children={(fieldApi: any) => (
            <fieldApi.CheckboxGroupField
              label={field.label}
              options={[{ label: field.label, value: true }]}
            />
          )}
        />
      )

    case 'date':
      return (
        <form.AppField
          name={field.name}
          children={(fieldApi: any) => (
            <fieldApi.DateInput
              label={field.label}
              placeholder={field.placeholder}
            />
          )}
        />
      )

    case 'combobox':
      return (
        <form.AppField
          name={field.name}
          children={(fieldApi: any) => (
            <fieldApi.BottomSheetComboboxField
              label={field.label}
              placeholder={field.placeholder || `Select or enter ${field.label.toLowerCase()}`}
              data={field.options || []}
            />
          )}
        />
      )

    case 'relationship':
      // For now, render as a select field
      // TODO: Implement proper relationship picker
      return (
        <form.AppField
          name={field.name}
          children={(fieldApi: any) => (
            <View>
              <fieldApi.SelectField
                label={field.label}
                placeholder={`Select ${field.relatedTable}`}
                options={field.options || []}
              />
              <Text variant="footnote" className="mt-1 text-text-disabled">
                Relationship to {field.relatedTable}
              </Text>
            </View>
          )}
        />
      )

    case 'file':
      // TODO: Implement file upload component
      return (
        <View className="p-4 border border-dashed border-border-default rounded-lg">
          <Text className="text-center text-text-disabled">
            File upload for {field.label} (coming soon)
          </Text>
        </View>
      )

    case 'object':
      // Render nested fields
      return (
        <View className="gap-4">
          <Text variant="heading" className="text-lg">{field.label}</Text>
          {field.fields?.map((nestedField) => (
            <ConvexFormField
              key={nestedField.name}
              field={nestedField}
              form={form}
            />
          ))}
        </View>
      )

    case 'array':
      // TODO: Implement array field with add/remove functionality
      return (
        <View className="gap-4">
          <Text variant="heading" className="text-lg">{field.label}</Text>
          <View className="p-4 border border-dashed border-border-default rounded-lg">
            <Text className="text-center text-text-disabled">
              Array field (coming soon)
            </Text>
          </View>
        </View>
      )

    default:
      return (
        <View className="p-4 bg-surface-high rounded-lg">
          <Text className="text-text-disabled">
            Unknown field type: {field.type} for {field.label}
          </Text>
        </View>
      )
  }
}