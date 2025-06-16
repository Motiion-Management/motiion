#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Figma Token Migration Script
 * Migrates from old token names to Figma's semantic token names
 * This enables Figma Code Connect compatibility
 */

// Comprehensive token mappings from old to new Figma names
const TOKEN_MAPPINGS = {
  // Background tokens
  'bg-background': 'bg-background-default',
  'bg-card': 'bg-surface-default',
  'bg-popover': 'bg-surface-high',
  'bg-muted': 'bg-surface-default',

  // Text tokens
  'text-foreground': 'text-text-default',
  'text-card-foreground': 'text-text-default',
  'text-popover-foreground': 'text-text-default',
  'text-primary-foreground': 'text-text-high',
  'text-secondary-foreground': 'text-text-high',
  'text-muted-foreground': 'text-text-disabled',
  'text-destructive-foreground': 'text-text-high',
  'text-accent-foreground': 'text-text-high',

  // Button surface tokens (special handling)
  'bg-button-surface-default': 'bg-button-surface',
  'bg-button-surface-high': 'bg-button-surface-high',
  'bg-button-surface-accent': 'bg-button-surface-accent',
  'bg-button-surface-disabled': 'bg-button-surface-disabled',

  // Border tokens
  'border-border': 'border-border-default',
  'border-input': 'border-border-default',
  'border-ring': 'border-border-accent',

  // Icon tokens (if used as text colors)
  'text-icon-default': 'text-icon-default',
  'text-icon-accent': 'text-icon-accent',
  'text-icon-disabled': 'text-icon-disabled',

  // Primary/Secondary/Accent mappings
  'bg-primary': 'bg-primary-500',
  'bg-secondary': 'bg-primary-900',
  'bg-accent': 'bg-primary-500',
  'bg-destructive': 'bg-text-error',
  'bg-tonal': 'bg-primary-850',

  // Text accent colors
  'text-primary': 'text-primary-500',
  'text-secondary': 'text-primary-900',
  'text-accent': 'text-text-accent',
  'text-destructive': 'text-text-error',
  'text-tonal-foreground': 'text-primary-500',
};

// Context-aware replacements for complex patterns
const PATTERN_REPLACEMENTS = [
  // Button variants using new surface tokens
  {
    pattern: /variant:\s*{\s*primary:\s*['"]([^'"]*?)bg-button-surface-default([^'"]*?)['"]/g,
    replacement: (match, before, after) =>
      match.replace('bg-button-surface-default', 'bg-button-surface'),
    description: 'Primary button surface',
  },

  // Disabled states
  {
    pattern: /disabled[^}]*?bg-button-surface-disabled/g,
    replacement: (match) =>
      match.replace('bg-button-surface-disabled', 'bg-button-surface-disabled'),
    description: 'Disabled button surface',
  },

  // Hover/Active states with new tokens
  {
    pattern: /hover:bg-primary/g,
    replacement: 'hover:bg-primary-500',
    description: 'Hover primary',
  },

  {
    pattern: /active:bg-primary/g,
    replacement: 'active:bg-primary-500',
    description: 'Active primary',
  },

  // iOS specific patterns
  {
    pattern: /ios:bg-background/g,
    replacement: 'ios:bg-background-default',
    description: 'iOS background',
  },

  // Dark mode patterns
  {
    pattern: /dark:bg-card/g,
    replacement: 'dark:bg-surface-default',
    description: 'Dark mode card',
  },
];

// Additional complex replacements for component-specific patterns
const COMPONENT_PATTERNS = {
  // TextField/Input components
  'placeholder:text-foreground': 'placeholder:text-text-default',
  'focus:border-primary': 'focus:border-primary-500',
  'focus:ring-ring': 'focus:ring-border-accent',

  // Button text variants
  'group-active:text-accent-foreground': 'group-active:text-text-high',
  'group-active:text-secondary-foreground': 'group-active:text-text-high',

  // Alert/Dialog components
  'data-[state=open]:bg-primary': 'data-[state=open]:bg-primary-500',
  'data-[state=closed]:bg-muted': 'data-[state=closed]:bg-surface-default',
};

class FigmaTokenMigrator {
  constructor() {
    this.changesLog = [];
    this.filesProcessed = 0;
    this.totalChanges = 0;
    this.errors = [];
  }

  /**
   * Find all TypeScript/TSX files recursively
   */
  findFiles(dir, files = []) {
    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip common build/dependency directories
          if (!['node_modules', 'build', 'dist', '.next', '.expo', '.turbo'].includes(item)) {
            this.findFiles(fullPath, files);
          }
        } else if (item.match(/\.(ts|tsx)$/) && !item.endsWith('.d.ts')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      this.errors.push(`Error reading directory ${dir}: ${error.message}`);
    }

    return files;
  }

  /**
   * Process a single file
   */
  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let modifiedContent = content;
      const fileChanges = [];

      // Apply pattern-based replacements first
      for (const replacement of PATTERN_REPLACEMENTS) {
        const matches = modifiedContent.match(replacement.pattern);
        if (matches) {
          const oldContent = modifiedContent;
          modifiedContent = modifiedContent.replace(replacement.pattern, replacement.replacement);

          if (oldContent !== modifiedContent) {
            fileChanges.push({
              type: 'pattern',
              description: replacement.description,
              count: matches.length,
            });
          }
        }
      }

      // Apply simple token mappings
      for (const [oldToken, newToken] of Object.entries(TOKEN_MAPPINGS)) {
        // Create regex that matches the token as a whole word
        const regex = new RegExp(`\\b${oldToken}\\b`, 'g');
        const matches = modifiedContent.match(regex);

        if (matches) {
          modifiedContent = modifiedContent.replace(regex, newToken);
          fileChanges.push({
            type: 'token',
            old: oldToken,
            new: newToken,
            count: matches.length,
          });
        }
      }

      // Apply component-specific patterns
      for (const [oldPattern, newPattern] of Object.entries(COMPONENT_PATTERNS)) {
        const regex = new RegExp(`\\b${oldPattern}\\b`, 'g');
        const matches = modifiedContent.match(regex);

        if (matches) {
          modifiedContent = modifiedContent.replace(regex, newPattern);
          fileChanges.push({
            type: 'component',
            old: oldPattern,
            new: newPattern,
            count: matches.length,
          });
        }
      }

      // Write file if changes were made
      if (modifiedContent !== originalContent) {
        if (!this.dryRun) {
          fs.writeFileSync(filePath, modifiedContent, 'utf8');
        }

        const totalFileChanges = fileChanges.reduce((sum, change) => sum + change.count, 0);
        console.log(
          `${this.dryRun ? '📝' : '✅'} ${path.relative(process.cwd(), filePath)} (${totalFileChanges} changes)`
        );

        this.changesLog.push({
          file: path.relative(process.cwd(), filePath),
          changes: fileChanges,
          totalChanges: totalFileChanges,
        });

        this.totalChanges += totalFileChanges;
      }

      this.filesProcessed++;
    } catch (error) {
      this.errors.push(`Error processing ${filePath}: ${error.message}`);
    }
  }

  /**
   * Run the migration
   */
  migrate(dryRun = false) {
    this.dryRun = dryRun;

    console.log(`🚀 ${dryRun ? 'Dry run: ' : ''}Starting Figma token migration...\n`);
    console.log("This will update your codebase to use Figma's semantic token names.");
    console.log('This enables better Code Connect integration and design system alignment.\n');

    // Find all files
    const files = this.findFiles(process.cwd());
    console.log(`Found ${files.length} TypeScript/TSX files\n`);

    // Process each file
    for (const file of files) {
      this.processFile(file);
    }

    this.printSummary();
  }

  /**
   * Print detailed summary
   */
  printSummary() {
    console.log('\n📊 Migration Summary');
    console.log('==================');
    console.log(`Files processed: ${this.filesProcessed}`);
    console.log(`Total changes: ${this.totalChanges}`);
    console.log(`Files modified: ${this.changesLog.length}`);

    if (this.changesLog.length > 0) {
      console.log('\n📝 Changes by type:');

      // Aggregate changes by type
      const changesByType = {
        token: new Map(),
        pattern: new Map(),
        component: new Map(),
      };

      for (const fileLog of this.changesLog) {
        for (const change of fileLog.changes) {
          const key =
            change.type === 'token'
              ? `${change.old} → ${change.new}`
              : change.description || `${change.old} → ${change.new}`;

          const current = changesByType[change.type].get(key) || 0;
          changesByType[change.type].set(key, current + change.count);
        }
      }

      // Print token changes
      if (changesByType.token.size > 0) {
        console.log('\n  Token replacements:');
        for (const [change, count] of changesByType.token) {
          console.log(`    ${change}: ${count} occurrences`);
        }
      }

      // Print pattern changes
      if (changesByType.pattern.size > 0) {
        console.log('\n  Pattern replacements:');
        for (const [change, count] of changesByType.pattern) {
          console.log(`    ${change}: ${count} occurrences`);
        }
      }

      // Print component changes
      if (changesByType.component.size > 0) {
        console.log('\n  Component-specific changes:');
        for (const [change, count] of changesByType.component) {
          console.log(`    ${change}: ${count} occurrences`);
        }
      }

      // Show top 10 modified files
      if (this.changesLog.length > 0) {
        console.log('\n  Top modified files:');
        const sortedFiles = [...this.changesLog]
          .sort((a, b) => b.totalChanges - a.totalChanges)
          .slice(0, 10);

        for (const fileLog of sortedFiles) {
          console.log(`    ${fileLog.file}: ${fileLog.totalChanges} changes`);
        }

        if (this.changesLog.length > 10) {
          console.log(`    ... and ${this.changesLog.length - 10} more files`);
        }
      }
    }

    if (this.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      for (const error of this.errors) {
        console.log(`    ${error}`);
      }
    }

    if (this.dryRun) {
      console.log('\n🔍 This was a dry run - no files were modified');
      console.log('To apply changes, run: npm run migrate-figma-tokens');
    } else {
      console.log('\n✨ Migration completed!');
      if (this.totalChanges > 0) {
        console.log('\n💡 Next steps:');
        console.log('  1. Test your app in both light and dark modes');
        console.log('  2. Verify component styling matches Figma designs');
        console.log('  3. Set up Figma Code Connect for automatic updates');
        console.log('  4. Commit your changes');

        console.log('\n📚 New token naming convention:');
        console.log('  - Backgrounds: bg-background-{default|low|accent|overlay}');
        console.log('  - Surfaces: bg-surface-{default|high|low|accent}');
        console.log('  - Text: text-text-{default|high|low|disabled|accent}');
        console.log('  - Buttons: bg-button-surface-{default|high|accent|disabled}');
        console.log('  - Borders: border-border-{default|low|high|accent}');
        console.log('  - Icons: text-icon-{default|accent|disabled}');
      }
    }
  }
}

// CLI interface
if (require.main === module) {
  const isDryRun = process.argv.includes('--dry-run');
  const migrator = new FigmaTokenMigrator();
  migrator.migrate(isDryRun);
}

module.exports = FigmaTokenMigrator;
