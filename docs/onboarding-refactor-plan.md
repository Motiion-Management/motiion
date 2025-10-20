# Onboarding & Profile Management Refactor Plan

**Status:** Phase 3 Complete - Ready for Phase 4
**Last Updated:** 2025-10-16
**Owner:** Development Team

---

## Executive Summary

Refactoring the onboarding system from a complex, dynamic STEP_REGISTRY pattern to explicit, declarative routes with shared schema validation. This improves maintainability, type safety, and code reusability across onboarding and profile editing.

---

## Current State (Accomplished)

### ✅ Phase 0: Foundation & Proof of Concept

1. **Established Shared Schema Pattern** (`displayName`)
   - Created: `packages/backend/convex/schemas/fields/displayName.ts`
   - Updated backend schemas (dancers.ts, choreographers.ts)
   - Updated `DisplayNameForm` to import shared schema
   - Type-safe end-to-end validation

2. **Created Explicit Onboarding Routes**
   - `app/(modals)/onboarding/dancer/display-name.tsx`
   - `app/(modals)/onboarding/choreographer/display-name.tsx`
   - Removed dynamic routing complexity

3. **Eliminated STEP_REGISTRY from Profile Editing**
   - Created `FieldEditSheet` wrapper component (reuses `Sheet`)
   - Refactored `app/(tabs)/profile/about.tsx` with explicit bottom sheets
   - Created `ProfileFieldList` for declarative field rendering
   - Single shared ScrollView across tabs
   - Conditional Attributes tab (dancers only)

4. **Clarified Tab Component Architecture**
   - Renamed `TabView` → `PagerTabView` (swipeable pages)
   - Created `TabbedView` (simple tab switching)
   - Clear separation of concerns

---

## Established Patterns

### Pattern 1: Shared Schema Layer

```typescript
// packages/backend/convex/schemas/fields/{fieldName}.ts
export const {field}FormSchema = z.object({
  {field}: {validator}
})

export const {field}DbField = {validator}.optional()

export type {Field}FormValues = z.infer<typeof {field}FormSchema>
```

### Pattern 2: Form Component Integration

```typescript
// components/forms/onboarding/{Field}Form.tsx
import { {field}FormSchema } from '@packages/backend/convex/schemas/fields'

export const {field}Schema = {field}FormSchema // backward compat
```

### Pattern 3: Explicit Onboarding Routes

```typescript
// app/(modals)/onboarding/{profileType}/{field-name}.tsx
export default function {ProfileType}{Field}Screen() {
  const profile = useQuery(api.{profileType}s.getMy{ProfileType}Profile, {})
  const updateProfile = useMutation(api.{profileType}s.updateMy{ProfileType}Profile)

  return (
    <BaseOnboardingScreen>
      <{Field}Form
        initialValues={{ {field}: profile?.{field} }}
        onSubmit={handleSubmit}
      />
    </BaseOnboardingScreen>
  )
}
```

### Pattern 4: Profile Edit Sheet

```typescript
<FieldEditSheet
  title="Edit {Field}"
  description="..."
  open={editingField === '{field}'}
  onClose={() => setEditingField(null)}
  canSave={canSubmit}
  onSave={() => formRef.current?.submit()}>
  <{Field}Form
    ref={formRef}
    initialValues={{ {field}: value }}
    onSubmit={handleSave}
    onValidChange={setCanSubmit}
  />
</FieldEditSheet>
```

---

## Field Categorization

### Shared Fields (Both Dancers & Choreographers)
- ✅ `displayName` - **COMPLETE**
- `headshots` - Photo uploads
- `representation` - Agency/management info
- `location` - Primary location

### Dancer-Only Fields (Physical Attributes)
- `height` - Feet/inches
- `ethnicity` - Array of selections
- `hairColor` - Enum selection
- `eyeColor` - Enum selection
- `gender` - Enum selection

### Dancer-Only Fields (Professional)
- `sizing` - Clothing measurements
- `sagAftraId` - Union membership
- `training` - Training history (complex)
- `workLocation` - Work preferences

### Choreographer-Only Fields
- `companyName` - Company/collective name
- `databaseUse` - Intended use case
- `specialties` - Dance styles
- `yearsOfExperience` - Number
- `notableWorks` - Array of strings

### Complex/Future Fields
- `projects` - Project history (uses separate table)
- `skills` - Skills array
- `resumeUploads` - File uploads
- `links` - Social/professional links

---

## Phase Breakdown

### ✅ Phase 1: Core Physical Attributes (Dancer-Only)
**Priority:** HIGH - Already in use on profile/about page
**Complexity:** LOW - Simple field types
**Status:** ✅ COMPLETE

- [x] `height` - Object with feet/inches
- [x] `ethnicity` - Multi-select array
- [x] `hairColor` - Single select enum
- [x] `eyeColor` - Single select enum
- [x] `gender` - Single select enum

**Deliverables per field:**
1. Create shared schema in `fields/{field}.ts`
2. Export from `fields/index.ts`
3. Update `attributes.ts` to use shared field (or deprecate into fields)
4. Update form component to import shared schema
5. Create `app/(modals)/onboarding/dancer/{field}.tsx`
6. Update profile about page (already has edit sheets)

---

### ✅ Phase 2: Shared Profile Fields
**Priority:** HIGH - Common across both profiles
**Complexity:** MEDIUM - File uploads, nested data
**Status:** ✅ COMPLETE

- [x] `headshots` - File upload array
- [x] `representation` - Nested object (agency, manager, etc.)
- [x] `location` - Location object with geo data

**Deliverables per field:**
1. Create shared schema in `fields/{field}.ts`
2. Update both dancer and choreographer schemas
3. Update form components
4. Create routes for both `dancer/` and `choreographer/`
5. Update profile about page

---

### ✅ Phase 3: Dancer Professional Fields
**Priority:** MEDIUM - Dancer-specific professional data
**Complexity:** MEDIUM
**Status:** ✅ COMPLETE

- [x] `sizing` - Clothing measurements object
- [x] `workLocation` - Work preference array
- [x] `sagAftraId` - Union ID string

**Deliverables per field:**
1. Create shared schema in `fields/{field}.ts`
2. Update dancer schema only
3. Update form component
4. Create `app/(modals)/onboarding/dancer/{field}.tsx`
5. Add to profile about page (new Work Details tab?)

---

### 🎯 Phase 4: Choreographer-Specific Fields
**Priority:** MEDIUM - Choreographer onboarding
**Complexity:** LOW-MEDIUM
**Status:** 📋 Planned

- [ ] `companyName` - String
- [ ] `databaseUse` - Enum/string
- [ ] `specialties` - Array of strings
- [ ] `yearsOfExperience` - Number (might overlap with dancers.attributes)
- [ ] `notableWorks` - Array of strings

**Deliverables per field:**
1. Create shared schema in `fields/{field}.ts`
2. Update choreographer schema only
3. Update/create form component
4. Create `app/(modals)/onboarding/choreographer/{field}.tsx`
5. Add to choreographer profile about page

---

### 🎯 Phase 5: Complex Relational Fields
**Priority:** LOW - Can defer, existing solutions may work
**Complexity:** HIGH - Separate tables, complex UI
**Status:** 📋 Deferred

- [ ] `training` - Training history (uses training table)
- [ ] `projects` - Project history (uses projects table)
- [ ] `skills` - Skills array with autocomplete
- [ ] `resumeUploads` - File upload array

**Note:** These may not fit the simple field pattern and might need custom solutions.

---

## Phase 1 Detailed Steps

### Step 1: Height Field

**Schema:**
```typescript
// packages/backend/convex/schemas/fields/height.ts
export const heightFormSchema = z.object({
  height: z.object({
    feet: z.number().min(3).max(8),
    inches: z.number().min(0).max(11)
  })
})

export const heightDbField = z.object({
  feet: z.number(),
  inches: z.number()
}).optional()
```

**Files to modify:**
1. Create `packages/backend/convex/schemas/fields/height.ts`
2. Update `packages/backend/convex/schemas/fields/index.ts`
3. Update `packages/backend/convex/schemas/attributes.ts` (use shared or deprecate)
4. Update `apps/native/components/forms/onboarding/HeightForm.tsx`
5. Create `apps/native/app/app/(modals)/onboarding/dancer/height.tsx`

### Step 2: Ethnicity Field

**Schema:**
```typescript
// packages/backend/convex/schemas/fields/ethnicity.ts
export const ETHNICITY = [
  'American Indian / Alaska Native',
  'Asian',
  'Black / African American',
  'Hispanic / Latino',
  'Native Hawaiian / Pacific Islander',
  'White / Caucasian'
] as const

export const ethnicityFormSchema = z.object({
  ethnicity: z.array(z.enum(ETHNICITY)).min(1)
})

export const ethnicityDbField = z.array(z.enum(ETHNICITY)).optional()
```

**Files to modify:**
1. Create `packages/backend/convex/schemas/fields/ethnicity.ts`
2. Update `packages/backend/convex/schemas/fields/index.ts`
3. Update `packages/backend/convex/schemas/attributes.ts`
4. Update `apps/native/components/forms/onboarding/EthnicityForm.tsx`
5. Create `apps/native/app/app/(modals)/onboarding/dancer/ethnicity.tsx`

### Step 3: Hair Color Field

**Schema:**
```typescript
// packages/backend/convex/schemas/fields/hairColor.ts
export const HAIR_COLOR = ['Black', 'Blonde', 'Brown', 'Red', 'Other'] as const

export const hairColorFormSchema = z.object({
  hairColor: z.enum(HAIR_COLOR)
})

export const hairColorDbField = z.enum(HAIR_COLOR).optional()
```

**Files to modify:**
1. Create `packages/backend/convex/schemas/fields/hairColor.ts`
2. Update `packages/backend/convex/schemas/fields/index.ts`
3. Update `packages/backend/convex/schemas/attributes.ts`
4. Update `apps/native/components/forms/onboarding/HairColorForm.tsx`
5. Create `apps/native/app/app/(modals)/onboarding/dancer/hair-color.tsx`

### Step 4: Eye Color Field

**Schema:**
```typescript
// packages/backend/convex/schemas/fields/eyeColor.ts
export const EYE_COLOR = [
  'Amber', 'Blue', 'Brown', 'Green', 'Gray', 'Mixed'
] as const

export const eyeColorFormSchema = z.object({
  eyeColor: z.enum(EYE_COLOR)
})

export const eyeColorDbField = z.enum(EYE_COLOR).optional()
```

**Files to modify:**
1. Create `packages/backend/convex/schemas/fields/eyeColor.ts`
2. Update `packages/backend/convex/schemas/fields/index.ts`
3. Update `packages/backend/convex/schemas/attributes.ts`
4. Update `apps/native/components/forms/onboarding/EyeColorForm.tsx`
5. Create `apps/native/app/app/(modals)/onboarding/dancer/eye-color.tsx`

### Step 5: Gender Field

**Schema:**
```typescript
// packages/backend/convex/schemas/fields/gender.ts
export const GENDER = ['Male', 'Female', 'Non-binary'] as const

export const genderFormSchema = z.object({
  gender: z.enum(GENDER)
})

export const genderDbField = z.enum(GENDER).optional()
```

**Files to modify:**
1. Create `packages/backend/convex/schemas/fields/gender.ts`
2. Update `packages/backend/convex/schemas/fields/index.ts`
3. Update `packages/backend/convex/schemas/attributes.ts`
4. Update `apps/native/components/forms/onboarding/GenderForm.tsx`
5. Create `apps/native/app/app/(modals)/onboarding/dancer/gender.tsx`

---

## Success Criteria

- [ ] All onboarding fields have explicit routes (no dynamic routing)
- [ ] All fields share schema validation between frontend and backend
- [ ] All fields are reusable in both onboarding and profile editing
- [ ] Type safety maintained throughout
- [ ] No STEP_REGISTRY references remain
- [ ] Profile editing works for both dancers and choreographers
- [ ] All existing onboarding flows continue to work

---

## Migration Strategy

1. **Parallel Implementation:** Keep old registry system working while building new routes
2. **Incremental Rollout:** Ship phases as they complete
3. **Cleanup:** Remove old registry code once all fields migrated
4. **Testing:** Verify each field works in both onboarding and profile editing

---

## Notes & Considerations

### Attributes Object Strategy
The current `attributes` object in dancers schema groups physical attributes. We have two options:

**Option A:** Keep attributes object, use shared schemas within it
```typescript
// attributes.ts uses shared fields
import { heightDbField, ethnicityDbField, ... } from './fields'
export const attributesPlainObject = {
  height: heightDbField,
  ethnicity: ethnicityDbField,
  // ...
}
```

**Option B:** Flatten attributes, deprecate the nested object
```typescript
// dancers.ts
export const dancers = {
  // Direct fields instead of nested attributes
  height: heightDbField,
  ethnicity: ethnicityDbField,
  // ...
}
```

**Recommendation:** Start with Option A (less disruptive), consider Option B in future refactor.

### Form Component Updates
Each form component needs to:
1. Import shared schema from backend
2. Export it as backward-compatible const
3. Update types to use shared types
4. No UI changes needed

### Profile Page Updates
The profile about page already has:
- Edit sheets for all attribute fields
- Conditional rendering for dancer vs choreographer
- ProfileFieldList component for declarative rendering
- Conditional Attributes tab (dancers only)

New onboarding routes just need to follow the pattern established by display-name.

---

## Progress Tracking

**Phase 0:** ✅ Complete (Foundation - displayName)
**Phase 1:** ✅ Complete (Dancer Attributes - height, ethnicity, hairColor, eyeColor, gender)
**Phase 2:** ✅ Complete (Shared Profile Fields - headshots, representation, location)
**Phase 3:** ✅ Complete (Dancer Professional Fields - sizing, workLocation, sagAftraId)
**Phase 4:** 📋 Ready to start (Choreographer-Specific Fields)
**Phase 5:** 📋 Deferred (Complex Relational Fields)
