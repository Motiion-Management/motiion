# Auto-Save Implementation Guide

This document explains the auto-save functionality implemented for the React Native onboarding forms.

## Overview

The auto-save system automatically persists form data to Convex as users interact with forms, eliminating the need for explicit save actions and preventing data loss.

## Core Components

### 1. `useAutoSaveForm` Hook

Located at: `/hooks/useAutoSaveForm.ts`

Main auto-save hook that provides:

- Debounced save functionality
- Save state management (saving, saved, error states)
- Field mapping for nested Convex structures
- Visual feedback integration

```typescript
const { saveField, saveFields, saveState } = useAutoSaveForm({
  debounceMs: 1000,
  fieldMapping: {
    hairColor: 'attributes.hairColor',
  },
});
```

### 2. `useAutoSaveAppForm` Hook

Located at: `/hooks/useAutoSaveAppForm.ts`

Enhanced version of the existing `useAppForm` that integrates auto-save:

- Automatically syncs form state with Convex
- Loads initial values from user data
- Tracks field changes and triggers saves

```typescript
const form = useAutoSaveAppForm({
  defaultValues: { hairColor: undefined },
  autoSave: {
    debounceMs: 500,
    fieldMapping: {
      hairColor: 'attributes.hairColor',
    },
  },
});
```

### 3. `AutoSaveIndicator` Component

Located at: `/components/form/AutoSaveIndicator.tsx`

Visual feedback component showing save status:

- "Saving..." with spinner
- "Saved" with checkmark
- Error states with retry options

### 4. `AutoSaveFormField` Component

Located at: `/components/form/AutoSaveFormField.tsx`

Wrapper component for individual form fields with auto-save.

## Usage Examples

### Simple Radio Field with Auto-Save

```typescript
const form = useAutoSaveAppForm({
  defaultValues: { hairColor: undefined },
  validators: { onChange: hairColorValidator },
  autoSave: {
    debounceMs: 500,
    fieldMapping: {
      'hairColor': 'attributes.hairColor'
    }
  }
})

// In render:
<ValidationModeForm form={form}>
  <form.AppField
    name="hairColor"
    children={(field) => <field.RadioGroupField options={radioOptions} />}
  />
</ValidationModeForm>

// Auto-save indicator
{form.autoSave.showIndicators && (
  <AutoSaveIndicator saveState={form.autoSave.saveState} />
)}
```

### Complex Form with Multiple Fields

```typescript
const form = useAutoSaveAppForm({
  defaultValues: {
    waist: undefined,
    inseam: undefined,
    chest: undefined,
  },
  autoSave: {
    debounceMs: 1000,
    fieldMapping: {
      waist: 'sizing.general.waist',
      inseam: 'sizing.general.inseam',
      chest: 'sizing.men.chest',
    },
  },
});
```

## Field Mapping

The system supports nested field updates through dot notation:

```typescript
fieldMapping: {
  'formFieldName': 'convex.nested.path'
}
```

This transforms flat form fields into the nested structure expected by Convex:

- `hairColor` → `{ attributes: { hairColor: value } }`
- `waist` → `{ sizing: { general: { waist: value } } }`

## Best Practices

1. **Debounce Timing**
   - Text inputs: 1000ms (1 second)
   - Select/Radio: 500ms
   - Sliders: 300ms

2. **Error Handling**
   - Show error states in UI
   - Implement retry mechanisms
   - Log failures for debugging

3. **Performance**
   - Only save changed fields
   - Batch related field updates
   - Use optimistic updates for instant feedback

4. **User Experience**
   - Always show save indicators
   - Prevent navigation during saves
   - Confirm unsaved changes before leaving

## Migration Guide

To migrate existing forms:

1. Replace `useAppForm` with `useAutoSaveAppForm`
2. Add field mapping configuration
3. Remove manual save logic from submit handlers
4. Add auto-save indicators to UI
5. Test thoroughly with network delays

## Future Enhancements

- Offline support with sync queue
- Conflict resolution for concurrent edits
- Bulk field updates optimization
- Version history and undo/redo
