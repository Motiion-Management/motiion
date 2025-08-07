# Dynamic Forms from Convex Schemas

## Overview

This system generates React Native forms dynamically from Convex Zod schemas, creating a seamless pipeline from backend database definitions to frontend UI components.

## Key Benefits

1. **Single Source of Truth**: Your Convex validators define both database schema AND form structure
2. **Zero Duplication**: No need to maintain separate form schemas
3. **Type Safety**: End-to-end TypeScript types from database to UI
4. **Automatic Validation**: Zod validators work on both backend and frontend
5. **Rapid Development**: Create new forms in minutes, not hours

## Architecture

```
Convex Zod Schema (Backend)
    ↓
Schema Introspection (convexSchemaToForm.ts)
    ↓
UI Metadata Enhancement (convexFormMetadata.ts)
    ↓
Dynamic Field Rendering (ConvexFormField.tsx)
    ↓
Complete Form (ConvexDynamicForm.tsx)
```

## Basic Usage

### 1. Import Your Convex Schema

```typescript
import { zExperiencesTvFilm } from '@packages/backend/convex/validators/experiencesTvFilm';
```

### 2. Define UI Metadata (Optional)

```typescript
const metadata = {
  studio: {
    component: 'combobox',
    placeholder: 'Select or enter studio',
    suggestions: ['Netflix', 'HBO', 'Disney+'],
  },
  startDate: {
    component: 'date',
    format: 'yyyy-MM-dd',
  },
};
```

### 3. Render the Form

```typescript
<ConvexDynamicForm
  schema={zExperiencesTvFilm}
  metadata={metadata}
  initialData={existingData}
  onChange={handleChange}
  exclude={['userId', 'private']} // Exclude system fields
/>
```

## Type Mappings

The system automatically maps Zod types to form components:

| Zod Type              | Form Component     | Notes                          |
| --------------------- | ------------------ | ------------------------------ |
| `z.string()`          | TextInput          | Email detection via validators |
| `z.number()`          | NumberInput        | With min/max support           |
| `z.boolean()`         | Checkbox           | Single checkbox                |
| `z.enum()`            | Select or Radio    | Based on option count          |
| `z.array(z.string())` | ChipsField         | Multi-value input              |
| `z.date()`            | DateInput          | Date picker                    |
| `z.object()`          | Form Section       | Nested fields                  |
| `zid('table')`        | RelationshipPicker | Convex relationships           |
| `zid('_storage')`     | FileUpload         | File storage                   |

## Advanced Features

### Conditional Fields

Use Zod discriminated unions for conditional logic:

```typescript
const schema = z.discriminatedUnion('eventType', [
  z.object({
    eventType: z.literal('tour'),
    tourName: z.string(),
    tourArtist: z.string(),
  }),
  z.object({
    eventType: z.literal('festival'),
    festivalTitle: z.string(),
  }),
]);
```

### Field Overrides

Override specific field configurations:

```typescript
<ConvexDynamicForm
  schema={schema}
  overrides={{
    title: {
      type: 'text',
      multiline: true,
      rows: 3
    }
  }}
/>
```

### Custom Components

Register custom field components:

```typescript
const metadata = {
  location: {
    component: 'custom',
    renderer: CustomLocationPicker,
  },
};
```

## Migration Guide

### From Static Forms to Dynamic

Before (400+ lines):

```typescript
export function TvFilmForm({ initialData, onChange }) {
  const form = useAppForm({
    defaultValues: { /* ... */ },
    validators: { /* ... */ }
  })

  return (
    <View>
      <form.Field name="title">
        {/* ... */}
      </form.Field>
      <form.Field name="studio">
        {/* ... */}
      </form.Field>
      {/* Many more fields... */}
    </View>
  )
}
```

After (20 lines):

```typescript
export function TvFilmForm({ initialData, onChange }) {
  return (
    <ConvexDynamicForm
      schema={zExperiencesTvFilm}
      metadata={tvFilmMetadata}
      initialData={initialData}
      onChange={onChange}
    />
  )
}
```

## Feature Flags

Enable dynamic forms progressively:

```typescript
<ExperienceForm
  experienceType="tv-film"
  useDynamicForm={true} // Enable for testing
  onChange={handleChange}
/>
```

## Metadata Configuration

Enhance forms with UI-specific hints without modifying backend schemas:

```typescript
export const formMetadata = {
  fieldName: {
    label: 'Custom Label',
    placeholder: 'Enter value...',
    helpText: 'Additional help',
    component: 'combobox',
    suggestions: ['Option 1', 'Option 2'],
    format: 'yyyy-MM-dd',
    multiline: true,
    rows: 4,
  },
};
```

## Best Practices

1. **Keep Schemas Pure**: Don't add UI logic to Convex validators
2. **Use Metadata**: UI hints belong in metadata, not schemas
3. **Exclude System Fields**: Filter out `userId`, `private`, etc.
4. **Test Incrementally**: Use feature flags during migration
5. **Leverage Type Safety**: Let TypeScript guide you

## API Reference

### ConvexDynamicForm Props

```typescript
interface ConvexDynamicFormProps {
  schema: z.ZodObject<any>; // Convex Zod schema
  metadata?: FormMetadata; // UI enhancements
  initialData?: Record<string, any>;
  onChange?: (data: any) => void;
  onSubmit?: (data: any) => void;
  exclude?: string[]; // Fields to exclude
  include?: string[]; // Fields to include (whitelist)
  overrides?: Record<string, Partial<FormFieldConfig>>;
  debounceMs?: number; // Debounce onChange (default: 300)
}
```

### Schema Introspection Utils

```typescript
// Convert schema to form configuration
convexSchemaToFormConfig(schema, options);

// Map Zod type to field type
mapZodTypeToFieldType(schema);

// Check if field is required
isRequired(schema);

// Extract enum values
getEnumValues(schema);
```

## Examples

See `/components/examples/DynamicFormExample.tsx` for working examples.

## Future Enhancements

- [ ] File upload component for `zid('_storage')`
- [ ] Relationship picker for `zid('users')`
- [ ] Array field with add/remove UI
- [ ] Conditional field visibility
- [ ] Form sections and tabs
- [ ] Custom validation messages
- [ ] Field dependencies
- [ ] Auto-save integration
