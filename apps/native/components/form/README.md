# Form Error Handling System

This directory contains a unified form error handling system that provides consistent, configurable error display across all form components.

## Overview

The system consists of:
- **`useFieldError`** - Unified error handling hook
- **`FormProvider`** - Combines error management and configuration
- **`FormConfigProvider`** - Form-level error display configuration  
- **`FormErrorProvider`** - External error management (server errors)

## Basic Usage

### 1. Wrap your form with FormProvider

```tsx
import { FormProvider } from '~/components/form/FormProvider';

function MyScreen() {
  return (
    <FormProvider>
      <MyFormContent />
    </FormProvider>
  );
}
```

### 2. Form components automatically get consistent error handling

```tsx
// All form components now use unified error logic
<form.AppField
  name="firstName"
  children={(field) => (
    <field.TextInput
      label="First Name"
      placeholder="Enter first name"
    />
  )}
/>
```

## Configuration Options

### Error Display Timing

Configure when validation errors should appear:

```tsx
<FormProvider 
  config={{
    errorDisplay: {
      timing: 'immediate',  // 'touched' | 'dirty' | 'immediate'
    }
  }}
>
  <MyForm />
</FormProvider>
```

### Complete Configuration

```tsx
<FormProvider 
  config={{
    errorDisplay: {
      timing: 'dirty',                    // When to show validation errors
      showFallbackMessages: true,         // Show fallback messages
      mergeExternalErrors: true,          // Merge server errors
      autoClearExternalErrors: true,      // Auto-clear when typing
    }
  }}
>
  <MyForm />
</FormProvider>
```

## External Error Management

Handle server/API errors alongside validation errors:

```tsx
import { useFormError } from '~/hooks/useFormError';

function MyFormScreen() {
  const { setExternalError, clearExternalErrors } = useFormError();

  const handleSubmit = async (data) => {
    try {
      await submitForm(data);
    } catch (error) {
      // Set field-specific server errors
      if (error.field === 'email') {
        setExternalError('email', 'Email already exists');
      } else {
        setExternalError('form', 'Network error. Please try again.');
      }
    }
  };

  return (
    <FormProvider>
      {/* Form fields automatically show external errors */}
      <form.AppField name="email" ... />
    </FormProvider>
  );
}
```

## Error Priority

1. **External errors** (server/API) - Always shown, highest priority
2. **Validation errors** (Zod schema) - Shown based on timing configuration
3. **Fallback messages** - Shown when validation fails but no specific message

## Per-Component Overrides

Individual components can override form-level configuration:

```tsx
// This field will show errors immediately, regardless of form config
const { errorMessage } = useFieldError(field, { 
  showWhen: 'immediate',
  fallbackMessage: 'Custom fallback message',
  fieldName: field.name 
});
```

## Migration from Old System

### Before
```tsx
// Manual error handling in each component
const isError = field.state.meta.isDirty && !field.state.meta.isValid;
const errorMessage = isError 
  ? field.state.meta.errors?.[0]?.message || 'Fallback'
  : undefined;

// Separate server error state
const [serverError, setServerError] = useState();
```

### After
```tsx
// Unified error handling
const { errorMessage } = useFieldError(field, { fieldName: field.name });

// Server errors handled automatically through FormProvider
const { setExternalError } = useFormError();
```

## Component Integration

All form components now automatically:
- Use consistent error timing
- Support external errors
- Auto-clear external errors when user types
- Follow form-level configuration
- Provide fallback messages

## Error Types

1. **Validation Errors**: From Zod schemas, shown based on timing config
2. **External Errors**: From server/API, always shown immediately  
3. **Fallback Errors**: Generic messages for better UX