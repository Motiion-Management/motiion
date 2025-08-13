import React from 'react';
import { View } from 'react-native';
import { FormFieldConfig } from '~/utils/convexSchemaToForm';
import { Text } from '~/components/ui/text';

interface ConvexFormFieldProps {
  field: FormFieldConfig;
  form: any; // TanStack form instance
}

/**
 * Dynamically renders the appropriate form component based on field configuration
 */
export function ConvexFormField({ field, form }: ConvexFormFieldProps) {
  // Skip certain system fields
  if (field.name === 'userId' || field.name === 'private') {
    return null;
  }

  // Determine container style based on width
  const width = field.metadata?.width || 'full';
  const containerClassName = width === 'full' ? 'w-full' : 'flex-1';

  // Check if field should be read-only or disabled
  const isReadOnly = field.metadata?.readOnly || false;
  const isDisabled = field.metadata?.disabled || false;

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <form.AppField
            name={field.name}
            children={(fieldApi: any) => (
              <fieldApi.InputField
                label={field.label}
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                keyboardType={field.type === 'email' ? 'email-address' : 'default'}
                autoCapitalize={
                  (field.type === 'email'
                    ? 'none'
                    : (field.metadata?.autoCapitalize as any) || 'sentences') as any
                }
                editable={!isReadOnly && !isDisabled}
                selectTextOnFocus={!isReadOnly}
                style={isReadOnly || isDisabled ? { opacity: 0.6 } : undefined}
              />
            )}
          />
        );

      case 'number':
        return (
          <form.AppField
            name={field.name}
            children={(fieldApi: any) => (
              <fieldApi.NumberInputField
                label={field.label}
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              />
            )}
          />
        );

      case 'select':
        return (
          <form.AppField
            name={field.name}
            children={(fieldApi: any) =>
              field.component === 'picker' ? (
                <fieldApi.BottomSheetPickerField
                  label={field.label}
                  placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
                  data={(field.options || []) as any}
                  helpText={field.helpText}
                  disabled={isReadOnly || isDisabled}
                />
              ) : field.component === 'year' ? (
                <fieldApi.YearPickerField
                  label={field.label}
                  placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
                  startYear={(field.metadata?.min as number | undefined) ?? 1900}
                  endYear={(field.metadata?.max as number | undefined) ?? new Date().getFullYear()}
                  helpText={field.helpText}
                  disabled={isReadOnly || isDisabled}
                />
              ) : (
                <fieldApi.SelectField
                  label={field.label}
                  placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
                  options={field.options || []}
                  disabled={isReadOnly || isDisabled}
                />
              )
            }
          />
        );

      case 'radio':
        return (
          <form.AppField
            name={field.name}
            children={(fieldApi: any) => (
              <fieldApi.RadioGroupField label={field.label} options={field.options || []} />
            )}
          />
        );

      case 'multiselect':
        return (
          <form.AppField
            name={field.name}
            children={(fieldApi: any) => (
              <fieldApi.MultiselectField label={field.label} options={field.options || []} />
            )}
          />
        );

      case 'chips':
        return (
          <form.AppField
            name={field.name}
            children={(fieldApi: any) => (
              <fieldApi.ChipsField
                label={field.label}
                placeholder={field.placeholder || `Add ${field.label.toLowerCase()}`}
                helpText={field.helpText}
                autoCapitalize={field.metadata?.autoCapitalize as any}
              />
            )}
          />
        );

      case 'checkbox':
        return (
          <form.AppField
            name={field.name}
            children={(fieldApi: any) => (
              <fieldApi.CheckboxField label={field.label} helpText={field.helpText} />
            )}
          />
        );

      case 'date':
        return (
          <form.AppField
            name={field.name}
            children={(fieldApi: any) => (
              <fieldApi.DatePickerField
                label={field.label}
                placeholder={field.placeholder}
                disabled={isReadOnly || isDisabled}
              />
            )}
          />
        );

      case 'combobox':
        return (
          <form.AppField
            name={field.name}
            children={(fieldApi: any) => (
              <fieldApi.BottomSheetComboboxField
                label={field.label}
                placeholder={field.placeholder || `Select or enter ${field.label.toLowerCase()}`}
                data={field.options || []}
                autoCapitalize={field.metadata?.autoCapitalize as any}
                disabled={isReadOnly || isDisabled}
              />
            )}
          />
        );

      case 'relationship':
        return (
          <form.AppField
            name={field.name}
            children={(fieldApi: any) => (
              <fieldApi.RelationshipPickerField
                label={field.label}
                relatedTable={field.relatedTable}
                placeholder={field.placeholder || `Select ${field.relatedTable}`}
                options={field.options as any}
                helpText={field.helpText}
              />
            )}
          />
        );

      case 'file':
        return (
          <form.AppField
            name={field.name}
            children={(fieldApi: any) => (
              <fieldApi.FileUploadField label={field.label} helpText={field.helpText} />
            )}
          />
        );

      case 'object':
        // Render nested fields
        return (
          <View className="gap-4">
            <Text variant="heading" className="text-lg">
              {field.label}
            </Text>
            {field.fields?.map((nestedField) => (
              <ConvexFormField key={nestedField.name} field={nestedField} form={form} />
            ))}
          </View>
        );

      case 'array':
        // TODO: Implement array field with add/remove functionality
        return (
          <View className="gap-4">
            <Text variant="heading" className="text-lg">
              {field.label}
            </Text>
            <View className="rounded-lg border border-dashed border-border-default p-4">
              <Text className="text-center text-text-disabled">Array field (coming soon)</Text>
            </View>
          </View>
        );

      default:
        return (
          <View className="rounded-lg bg-surface-high p-4">
            <Text className="text-text-disabled">
              Unknown field type: {field.type} for {field.label}
            </Text>
          </View>
        );
    }
  };

  return <View className={containerClassName}>{renderField()}</View>;
}
