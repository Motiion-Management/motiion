# @packages/web-ui

Comprehensive UI library and business logic for the Motiion platform. This package contains all reusable components, forms, hooks, and configuration patterns extracted from the web application.

## 📁 Package Structure

```
packages/web-ui/
├── components/          # UI components and features
│   ├── ui/             # Base UI components (buttons, inputs, cards, etc.)
│   └── features/       # Feature-specific components (profile, search, etc.)
├── forms/              # Form implementations with business logic
├── lib/                # Utilities and hooks
│   ├── hooks/          # Custom React hooks
│   └── server/         # Server-side utilities
├── config/             # Configuration patterns
├── constants/          # Application constants
└── types/              # TypeScript type definitions
```

## 🎯 Key Features

### 1. **Complete UI Component Library**
- **46+ UI components** with consistent styling
- **Radix UI primitives** for accessibility
- **Form field components** with validation
- **Feature-specific components** for profile, search, agencies

### 2. **Business Logic Forms**
- **Onboarding forms** with phone validation and location integration
- **Sizing forms** with gender-specific measurements
- **Profile editing forms** with real-time sync
- **Skills management** with proficiency levels
- **Attributes forms** with multi-select and validation

### 3. **Custom Hooks**
- **`use-stable-query`** - Optimized Convex queries without UI flicker
- **`use-toast`** - Toast notification system with global state
- **Form hooks** - React Hook Form integration patterns

### 4. **Configuration Patterns**
- **Tailwind CSS** configuration with custom fonts and design system
- **Next.js** configuration patterns for PWA, Clerk, and Convex
- **Design tokens** and theme configuration

## 🚀 Usage

### Components

```tsx
import { Button, Card, Form } from '@packages/web-ui/components/ui'
import { ProfileCard } from '@packages/web-ui/components/features/profile'

// Use components in your app
<Card>
  <ProfileCard userId="123" />
  <Button variant="primary">Save Changes</Button>
</Card>
```

### Forms

```tsx
import { PersonalDetailsFormProvider } from '@packages/web-ui/forms'

// Use form with complete business logic
<PersonalDetailsFormProvider 
  id={userId}
  defaultValues={userData}
/>
```

### Hooks

```tsx
import { useStableQuery } from '@packages/web-ui/lib/hooks'

// Optimized Convex queries
const data = useStableQuery(api.users.getUser, { id: userId })
```

### Configuration

```tsx
import { motiionTailwindConfig } from '@packages/web-ui/config'

// Use in your tailwind.config.js
export default motiionTailwindConfig
```

## 📋 Form Implementations

### Onboarding Form
- **Phone validation** with libphonenumber-js
- **Location integration** with structured address objects
- **Date validation** with custom Zod transformers
- **Multi-step progression** with onboarding flow state

### Sizing Forms
- **Gender-specific measurements** (male/female/general)
- **Wheel picker interface** for measurements
- **Real-time sync** with Convex backend
- **Units handling** (inches) with formatting

### Attributes Form
- **Multi-select ethnicity** with complex validation
- **Height picker** with custom formatting
- **Drawer-based editing** for mobile-first UX

### Representation Form
- **Dual-mode agency selection** (search vs manual)
- **Dynamic agency creation** for custom entries
- **Tab-based interface** with form state management

### Skills Form
- **Multi-level proficiency** (expert/proficient/novice)
- **Dynamic skill management** with categorization
- **FAB drawer interface** for adding skills

## 🔧 Technical Details

### Dependencies
- **React Hook Form** for form state management
- **Zod** for validation schemas
- **Convex** for real-time data synchronization
- **Radix UI** for accessible components
- **Tailwind CSS** for styling
- **Framer Motion** for animations

### Architecture Patterns
- **Unidirectional data flow** from parent to child
- **Custom hook patterns** for business logic extraction
- **Form provider patterns** for complex form orchestration
- **Real-time synchronization** with optimistic updates

## 🎨 Design System

### Typography
- **Semantic font sizes** (h1-h6, body, link, label)
- **Consistent spacing** and letter spacing
- **Montserrat font family** throughout

### Colors
- **CSS custom properties** for theme support
- **Consistent color palette** with semantic naming
- **Dark mode support** with CSS variables

### Layout
- **Grid areas** for complex layouts
- **Responsive breakpoints** with custom screen sizes
- **Mobile-first** design patterns

## 🔍 Key Business Logic

### Form Validation
- **Phone number parsing** and international formatting
- **Location validation** with country/state/city structure
- **Date validation** with custom transformers
- **Either/or validation** patterns

### Real-time Updates
- **Optimistic updates** with Convex mutations
- **Form reset patterns** after successful submission
- **Auto-closing drawers** on success

### State Management
- **Form state synchronization** with backend
- **Preloaded data integration** with default values
- **Complex form orchestration** with multiple steps

## 📝 Migration Notes

This package preserves all valuable business logic from the original web application:
- **All UI components** have been extracted and preserved
- **Form implementations** maintain full business logic
- **Custom hooks** provide optimized data fetching
- **Configuration patterns** enable consistent setup

The package is designed to be used as a comprehensive UI library while new mobile-specific components are developed in the native app.