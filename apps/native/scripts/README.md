# Token Migration Scripts

These scripts help migrate your codebase from the old color tokens to the new Figma-aligned design tokens.

## Quick Start

```bash
# Run a dry-run first to see what would change
npm run migrate-tokens:dry

# Apply the migrations
npm run migrate-tokens
```

## What Gets Migrated

### Key Color Changes
- **Primary color**: Changed from black/white to teal (#00ccb7)
- **Button surfaces**: Now use dedicated `button-surface-*` tokens
- **Accent color**: Now maps to primary teal

### Specific Migrations

| Old Token | New Token | Context |
|-----------|-----------|---------|
| `bg-primary` | `bg-button-surface-default` | Button variants |
| `bg-accent` | `bg-primary` | Accent elements |
| `text-primary` | `text-primary-foreground` | Button text |
| `bg-primary/15` | `bg-secondary` | Secondary buttons |
| `bg-muted` | `bg-button-surface-disabled` | Disabled buttons |

### Pattern-Based Changes

The script also handles context-aware replacements:

- **Button primary variants**: `bg-primary` → `bg-button-surface-default`
- **Button accent variants**: `bg-accent` → `bg-primary` 
- **Button text**: `text-primary` → `text-primary-foreground`
- **iOS button text**: `ios:text-primary` → `ios:text-primary-foreground`
- **Disabled states**: Updates disabled button backgrounds

## Files Processed

The script processes all `.ts` and `.tsx` files in:
- `app/`
- `components/`
- `lib/`

It skips:
- `node_modules/`
- Build directories (`build/`, `dist/`, `.next/`, `.expo/`)
- Type definition files (`.d.ts`)

## Migration Logic

1. **Pattern-based replacements** run first for context-aware changes
2. **Simple token replacements** handle direct substitutions
3. **File changes** are only written if modifications were made
4. **Summary report** shows all changes made

## Example Output

```
🚀 Starting token migration...

Found 47 TypeScript/TSX files

✅ components/nativewindui/Button.tsx (3 changes)
✅ app/auth/login/index.tsx (1 changes)

📊 Migration Summary
==================
Files processed: 47
Total changes: 12

📝 Changes made:

  Pattern-based changes:
    Primary button variant: 2 in components/nativewindui/Button.tsx
    Accent button → primary teal: 1 in components/auth/GoogleButton.tsx

  Token replacements:
    bg-primary/15 → bg-secondary: 3 in components/form/appForm.tsx
    text-primary → text-primary-foreground: 2 in components/nativewindui/Button.tsx

✨ Migration completed!
```

## Manual Review Needed

After running the migration, review these areas:

1. **Context-specific usage** - Some tokens might need manual adjustment based on usage context
2. **Custom components** - Components with unique styling requirements
3. **Conditional classes** - Complex className expressions might need manual fixes
4. **Testing** - Ensure your app still looks correct in both light and dark modes

## Rollback

Since the script modifies files directly, make sure to:
1. **Commit your changes** before running the migration
2. **Review the diff** after migration
3. **Test thoroughly** before final commit

If you need to rollback:
```bash
git checkout -- .
```

## Troubleshooting

**Script doesn't find files**: Make sure you're running from the `apps/native` directory

**No changes detected**: Your codebase might already be using the new tokens

**Unexpected changes**: Review the `TOKEN_MIGRATIONS` and `PATTERN_REPLACEMENTS` in the script

**Partial migration**: You can run the script multiple times safely - it will only change what needs changing