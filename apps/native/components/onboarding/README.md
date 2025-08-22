# Onboarding Components

A comprehensive onboarding system built with group-based navigation, gesture controls, and reusable form components.

## Architecture Overview

### Components Structure
```
components/
├── forms/onboarding/          # Reusable form components
│   ├── BaseOnboardingForm.tsx # Base form wrapper
│   ├── DisplayNameForm.tsx    # Individual form implementations
│   ├── types.ts              # Form interfaces
│   └── index.ts              # Exports
└── onboarding/               # Navigation & UI components
    ├── OnboardingGroupPager.tsx    # Enhanced pager with gestures
    ├── GroupProgressBar.tsx        # Progress visualization
    ├── GroupPageIndicator.tsx      # Page dots
    ├── ReviewFormSheet.tsx         # Modal form editing
    ├── GestureTutorial.tsx         # User guidance
    └── index.ts                    # Exports
```

### Key Features

#### 🎯 Group-Based Navigation
- **5 logical groups**: Profile, Attributes, Work Details, Experiences, Review
- **Progress visualization**: Digestible chunks instead of 20+ individual steps
- **Smart routing**: Automatic flow management based on user profile type

#### 🤏 Gesture Navigation
- **Swipe controls**: Left/right navigation between forms
- **Validation sync**: Can't advance on invalid forms
- **Haptic feedback**: Success/warning vibrations
- **Tutorial overlay**: Guides new users

#### 📝 Reusable Forms
- **Mode support**: Fullscreen and sheet presentations
- **Validation hooks**: Real-time validation state
- **Auto-focus**: Smart focus management
- **Consistent UX**: Shared styling and behavior

#### 🔄 Modal Editing
- **Sheet presentation**: Edit forms from review screens
- **Dynamic sizing**: Optimized heights per form
- **Auto-save**: Changes persist automatically

## Usage Examples

### Basic Pager Group
```tsx
<OnboardingGroupPager
  forms={ATTRIBUTE_FORMS}
  onFormComplete={handleFormComplete}
  onPageChange={handlePageChange}
  enableGestureNavigation={true}
  showGestureTutorial={true}
/>
```

### Form Sheet
```tsx
const formSheet = useReviewFormSheet({
  onFormComplete: (formType, data) => {
    console.log('Updated:', formType, data)
  }
})

<ReviewFormSheet
  isOpen={formSheet.isOpen}
  onClose={formSheet.closeForm}
  formType={formSheet.currentFormType}
  onFormComplete={formSheet.handleFormComplete}
/>
```

### Progress Tracking
```tsx
<GroupProgressBar /> // Automatically syncs with flow state
```

## Form Component Pattern

All forms follow this pattern:

```tsx
export const MyForm = forwardRef<OnboardingFormRef, OnboardingFormProps<MyFormData>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen', ...props }, ref) => {
    return (
      <BaseOnboardingForm
        ref={ref}
        title="Form Title"
        canProgress={isValid}
        mode={mode}
        onCancel={onCancel}
        onSubmit={handleSubmit}
        {...props}>
        {/* Form content */}
      </BaseOnboardingForm>
    )
  }
)
```

## Flow Configuration

Groups are defined in `useOnboardingGroupFlow`:

```tsx
export const ONBOARDING_GROUPS = {
  profile: {
    key: 'profile',
    label: 'Profile',
    steps: ['profile-type', 'resume'],
    basePath: '/app/onboarding/profile',
  },
  // ... other groups
}
```

## Testing

Test the implementation through the main onboarding flow:
- Access groups via `/app/onboarding/profile`, `/app/onboarding/attributes`, etc.
- Preview progress visualization with GroupProgressBar
- Test individual groups with OnboardingGroupPager
- Validate gesture navigation within groups
- Demo modal editing from review screens