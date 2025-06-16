# Figma Code Connect Setup

This project is configured for Figma Code Connect integration, which allows direct mapping between Figma design components and React Native code components.

## Prerequisites

- **Figma Organization or Enterprise Plan**: Code Connect is only available on paid plans
- **Figma Design System**: Well-structured design system with consistent naming
- **Design Tokens**: Our project uses Figma's semantic token structure

## Current Setup

### 1. Design Token Migration ✅

We've successfully migrated all design tokens to match Figma's exact naming convention:

```css
/* Examples of migrated tokens */
--background-default: 255 255 255;
--surface-default: 248 249 250;
--text-default: 21 25 28;
--button-surface-default: 21 25 28;
--primary-500: 0 204 183;
```

This ensures seamless mapping between Figma tokens and CSS variables.

### 2. Component Structure ✅

Created Code Connect specification files:

- `Button.figma.tsx` - Maps Figma Button variants to React Native Button component
- `figma.config.js` - Main configuration for Code Connect

### 3. Package Installation ✅

- Installed `@figma/code-connect` package
- Added npm scripts for Code Connect operations

## Usage (When Code Connect is Available)

### Initial Setup

1. **Authenticate with Figma**:

   ```bash
   npx figma connect auth
   ```

2. **Connect your first component**:

   ```bash
   pnpm figma:connect
   ```

   This will scan for `.figma.tsx` files and connect them to Figma components.

3. **Publish component mappings**:
   ```bash
   pnpm figma:publish
   ```

### Component Mapping Example

Our Button component mapping handles:

**Figma Properties → React Native Props**

- `Variant: Primary` → `variant="primary"`
- `Size: Large` → `size="lg"`
- `State: Disabled` → `disabled={true}`
- `Label: "Click me"` → `children="Click me"`

### Automated Code Generation

Once connected, Figma Code Connect will:

1. Generate React Native code snippets directly in Figma
2. Maintain consistency between design and code
3. Auto-update when design tokens change
4. Provide component usage examples

## Benefits for MCP/Screen Scaffolding

With Code Connect properly configured:

1. **Design-First Development**: Generate components directly from Figma designs
2. **Token Consistency**: Automatic design token mapping ensures visual consistency
3. **Rapid Prototyping**: Quickly scaffold new screens using existing design patterns
4. **Reduced Design Debt**: Real-time sync between design changes and code

## File Structure

```
apps/native/
├── figma.config.js              # Main Code Connect configuration
├── components/
│   └── nativewindui/
│       ├── Button.tsx           # Component implementation
│       └── Button.figma.tsx     # Code Connect specification
├── global.css                   # Figma design tokens as CSS variables
└── tailwind.config.ts           # Token mappings for Tailwind
```

## Next Steps

1. **Upgrade Figma Plan**: To enable Code Connect functionality
2. **Add More Components**: Create `.figma.tsx` files for other UI components
3. **Refine Token Mappings**: Ensure all design tokens are properly mapped
4. **Document Component Variants**: Create comprehensive documentation for all component states

## Component Coverage

### Ready for Code Connect

- ✅ Button - All variants and sizes mapped
- 🚧 Text - Typography components ready for mapping
- 🚧 Input - Form components ready for mapping

### Needs Code Connect Specs

- ⏳ Card - Surface components
- ⏳ Avatar - User interface elements
- ⏳ Badge - Status indicators

## Troubleshooting

### Common Issues

1. **"Code Connect is only available on Organization plans"**

   - This is expected until plan upgrade
   - All setup work is complete and ready to activate

2. **Token Mismatch Errors**

   - Verify Figma token names match CSS variable names exactly
   - Check `global.css` and `tailwind.config.ts` consistency

3. **Component Not Found**
   - Ensure `.figma.tsx` files are in same directory as component
   - Verify Figma node IDs are correct in mapping files

---

_This setup prepares the project for immediate Code Connect activation when the Figma plan allows it._
