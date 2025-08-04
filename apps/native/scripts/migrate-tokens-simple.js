#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Simple Token Migration Script
 * Migrates old color token usage to new Figma-aligned tokens
 * No external dependencies required
 */

// Define the migration mappings based on our theme changes
const TOKEN_MIGRATIONS = {
  // Button variants - context matters
  'bg-primary': {
    contexts: {
      button: 'bg-button-surface-default',
      default: 'bg-primary', // Now teal instead of black/white
    },
    description: 'Primary color (now teal #00ccb7)',
  },

  // Accent is now primary teal
  'bg-accent': {
    contexts: {
      default: 'bg-primary',
    },
    description: 'Accent color → primary teal',
  },

  // Button text migrations
  'text-primary(?!-)': {
    // Negative lookahead to avoid text-primary-foreground
    contexts: {
      button: 'text-primary-foreground',
      default: 'text-foreground',
    },
    description: 'Primary text color',
  },

  // iOS specific button styles that need updating
  'ios:text-primary': {
    contexts: {
      default: 'ios:text-primary-foreground',
    },
    description: 'iOS primary text',
  },

  // Secondary button backgrounds
  'bg-primary/15': {
    contexts: {
      default: 'bg-secondary',
    },
    description: 'Secondary button background',
  },

  'dark:bg-primary/30': {
    contexts: {
      default: 'dark:bg-secondary',
    },
    description: 'Dark mode secondary button',
  },

  // Disabled states
  'bg-muted': {
    contexts: {
      button: 'bg-button-surface-disabled',
      default: 'bg-muted', // Keep for non-button usage
    },
    description: 'Muted background',
  },
};

// Specific pattern-based replacements for better context awareness
const PATTERN_REPLACEMENTS = [
  {
    // Button primary variant
    pattern: /(variant:\s*{\s*primary:\s*['"][^'"]*?)bg-primary([^'"]*?['"])/g,
    replacement: '$1bg-button-surface-default$2',
    description: 'Primary button variant',
  },

  {
    // Button accent variant should use primary (teal)
    pattern: /(variant:\s*{\s*accent:\s*['"][^'"]*?)bg-accent([^'"]*?['"])/g,
    replacement: '$1bg-primary$2',
    description: 'Accent button → primary teal',
  },

  {
    // Button text primary variant
    pattern: /(variant:\s*{\s*primary:\s*['"][^'"]*?)text-primary([^-][^'"]*?['"])/g,
    replacement: '$1text-primary-foreground$2',
    description: 'Primary button text',
  },

  {
    // Disabled button states
    pattern: /(disabled.*?)bg-muted/g,
    replacement: '$1bg-button-surface-disabled',
    description: 'Disabled button background',
  },

  {
    // iOS secondary button text
    pattern: /ios:text-primary(\s)/g,
    replacement: 'ios:text-primary-foreground$1',
    description: 'iOS secondary button text',
  },
];

class SimpleTokenMigrator {
  constructor() {
    this.changesLog = [];
    this.filesProcessed = 0;
    this.totalChanges = 0;
  }

  /**
   * Find all TypeScript/TSX files recursively
   */
  findFiles(dir, files = []) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules and other build directories
        if (!['node_modules', 'build', 'dist', '.next', '.expo'].includes(item)) {
          this.findFiles(fullPath, files);
        }
      } else if (item.match(/\.(ts|tsx)$/) && !item.endsWith('.d.ts')) {
        files.push(fullPath);
      }
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
      let fileChanges = 0;

      // Apply pattern-based replacements first (more context-aware)
      for (const replacement of PATTERN_REPLACEMENTS) {
        const matches = modifiedContent.match(replacement.pattern);
        if (matches) {
          modifiedContent = modifiedContent.replace(replacement.pattern, replacement.replacement);
          const changeCount = matches.length;
          fileChanges += changeCount;

          this.changesLog.push({
            file: path.relative(process.cwd(), filePath),
            type: 'pattern',
            description: replacement.description,
            occurrences: changeCount,
          });
        }
      }

      // Apply simple token replacements
      for (const [tokenPattern, config] of Object.entries(TOKEN_MIGRATIONS)) {
        const regex = new RegExp(tokenPattern, 'g');
        const matches = modifiedContent.match(regex);

        if (matches) {
          // For now, use default context. Could be made smarter.
          const newToken = config.contexts.default || config.contexts.button;
          modifiedContent = modifiedContent.replace(regex, newToken);

          const changeCount = matches.length;
          fileChanges += changeCount;

          this.changesLog.push({
            file: path.relative(process.cwd(), filePath),
            type: 'token',
            oldToken: tokenPattern,
            newToken,
            description: config.description,
            occurrences: changeCount,
          });
        }
      }

      // Write file if changes were made
      if (modifiedContent !== originalContent) {
        if (!this.dryRun) {
          fs.writeFileSync(filePath, modifiedContent, 'utf8');
        }
        console.log(
          `${this.dryRun ? '📝' : '✅'} ${path.relative(
            process.cwd(),
            filePath
          )} (${fileChanges} changes)`
        );
        this.totalChanges += fileChanges;
      }

      this.filesProcessed++;
    } catch (error) {
      console.error(`❌ Error processing ${filePath}: ${error.message}`);
    }
  }

  /**
   * Run the migration
   */
  migrate(dryRun = false) {
    this.dryRun = dryRun;

    console.log(`🚀 ${dryRun ? 'Dry run: ' : ''}Starting token migration...\n`);

    // Find all files in current directory
    const files = this.findFiles(process.cwd());
    console.log(`Found ${files.length} TypeScript/TSX files\n`);

    // Process each file
    for (const file of files) {
      this.processFile(file);
    }

    this.printSummary();
  }

  /**
   * Print summary
   */
  printSummary() {
    console.log('\n📊 Migration Summary');
    console.log('==================');
    console.log(`Files processed: ${this.filesProcessed}`);
    console.log(`Total changes: ${this.totalChanges}`);

    if (this.changesLog.length > 0) {
      console.log('\n📝 Changes made:');

      // Group changes by type
      const patternChanges = this.changesLog.filter((c) => c.type === 'pattern');
      const tokenChanges = this.changesLog.filter((c) => c.type === 'token');

      if (patternChanges.length > 0) {
        console.log('\n  Pattern-based changes:');
        patternChanges.forEach((change) => {
          console.log(`    ${change.description}: ${change.occurrences} in ${change.file}`);
        });
      }

      if (tokenChanges.length > 0) {
        console.log('\n  Token replacements:');
        tokenChanges.forEach((change) => {
          console.log(
            `    ${change.oldToken} → ${change.newToken}: ${change.occurrences} in ${change.file}`
          );
        });
      }
    }

    if (this.dryRun) {
      console.log('\n🔍 This was a dry run - no files were modified');
      console.log('To apply changes, run: node scripts/migrate-tokens-simple.js');
    } else {
      console.log('\n✨ Migration completed!');
      if (this.totalChanges > 0) {
        console.log('\n💡 Next steps:');
        console.log('  1. Test your app to ensure everything works');
        console.log('  2. Review changes and commit if satisfied');
      }
    }
  }
}

// CLI interface
if (require.main === module) {
  const isDryRun = process.argv.includes('--dry-run');
  const migrator = new SimpleTokenMigrator();
  migrator.migrate(isDryRun);
}

module.exports = SimpleTokenMigrator;
