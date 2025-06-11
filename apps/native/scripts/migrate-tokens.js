#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * Token Migration Script
 * Migrates old color token usage to new Figma-aligned tokens
 */

// Define the migration mappings
const TOKEN_MIGRATIONS = {
  // Button-specific migrations
  'bg-primary': {
    context: 'button',
    newToken: 'bg-button-surface-default',
    description: 'Primary button background'
  },
  
  // Background migrations - context-aware
  'bg-card': {
    context: 'surface',
    newToken: 'bg-card', // stays the same but values updated
    description: 'Card background'
  },
  
  // Text migrations
  'text-primary': {
    context: 'button-text',
    newToken: 'text-primary-foreground',
    description: 'Primary button text'
  },
  
  'text-muted-foreground': {
    context: 'general',
    newToken: 'text-muted-foreground', // stays same but values updated
    description: 'Muted text color'
  },
  
  // Border migrations
  'border-primary': {
    context: 'general',
    newToken: 'border-border',
    description: 'Default border color'
  },
  
  // Icon migrations
  'text-accent': {
    context: 'icon',
    newToken: 'text-icon-accent',
    description: 'Accent icon color'
  }
};

// More specific context-aware replacements
const CONTEXT_AWARE_MIGRATIONS = [
  {
    // Button primary variant should use button surface
    pattern: /variant:\s*{\s*primary:\s*['"](.*?)bg-primary(.*?)['"]/g,
    replacement: (match, before, after) => 
      match.replace('bg-primary', 'bg-button-surface-default')
  },
  
  {
    // Accent buttons should use primary color (now teal)
    pattern: /variant:\s*{\s*accent:\s*['"](.*?)bg-accent(.*?)['"]/g,
    replacement: (match, before, after) => 
      match.replace('bg-accent', 'bg-primary')
  },
  
  {
    // Disabled button states
    pattern: /disabled.*?bg-muted/g,
    replacement: (match) => 
      match.replace('bg-muted', 'bg-button-surface-disabled')
  },
  
  {
    // Primary text in buttons
    pattern: /(text-primary)(?!\s*-)/g,
    replacement: 'text-primary-foreground'
  }
];

// Files to process (TypeScript and TSX files)
const FILE_PATTERNS = [
  'app/**/*.{ts,tsx}',
  'components/**/*.{ts,tsx}',
  'lib/**/*.{ts,tsx}'
];

// Files to ignore
const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/build/**',
  '**/dist/**',
  '**/*.d.ts'
];

class TokenMigrator {
  constructor() {
    this.changesLog = [];
    this.filesProcessed = 0;
    this.totalChanges = 0;
  }

  /**
   * Main migration function
   */
  async migrate() {
    console.log('🚀 Starting token migration...\n');
    
    try {
      const files = await this.findFiles();
      console.log(`Found ${files.length} files to process\n`);
      
      for (const file of files) {
        await this.processFile(file);
      }
      
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  }

  /**
   * Find all files to process
   */
  async findFiles() {
    const allFiles = [];
    
    for (const pattern of FILE_PATTERNS) {
      const files = await glob(pattern, {
        ignore: IGNORE_PATTERNS,
        cwd: process.cwd()
      });
      allFiles.push(...files);
    }
    
    // Remove duplicates
    return [...new Set(allFiles)];
  }

  /**
   * Process a single file
   */
  async processFile(filePath) {
    try {
      const fullPath = path.resolve(filePath);
      const content = fs.readFileSync(fullPath, 'utf8');
      const originalContent = content;
      
      let modifiedContent = content;
      let fileChanges = 0;
      
      // Apply context-aware migrations
      for (const migration of CONTEXT_AWARE_MIGRATIONS) {
        const matches = modifiedContent.match(migration.pattern);
        if (matches) {
          modifiedContent = modifiedContent.replace(migration.pattern, migration.replacement);
          fileChanges += matches.length;
        }
      }
      
      // Apply simple token replacements
      for (const [oldToken, config] of Object.entries(TOKEN_MIGRATIONS)) {
        const regex = new RegExp(`\\b${oldToken}\\b`, 'g');
        const matches = modifiedContent.match(regex);
        
        if (matches) {
          modifiedContent = modifiedContent.replace(regex, config.newToken);
          fileChanges += matches.length;
          
          this.changesLog.push({
            file: filePath,
            oldToken,
            newToken: config.newToken,
            description: config.description,
            occurrences: matches.length
          });
        }
      }
      
      // Write back if changes were made
      if (modifiedContent !== originalContent) {
        fs.writeFileSync(fullPath, modifiedContent, 'utf8');
        console.log(`✅ Updated ${filePath} (${fileChanges} changes)`);
        this.totalChanges += fileChanges;
      }
      
      this.filesProcessed++;
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  /**
   * Print migration summary
   */
  printSummary() {
    console.log('\n📊 Migration Summary');
    console.log('==================');
    console.log(`Files processed: ${this.filesProcessed}`);
    console.log(`Total changes: ${this.totalChanges}`);
    
    if (this.changesLog.length > 0) {
      console.log('\n📝 Changes made:');
      
      // Group by token
      const groupedChanges = this.changesLog.reduce((acc, change) => {
        const key = `${change.oldToken} → ${change.newToken}`;
        if (!acc[key]) {
          acc[key] = {
            description: change.description,
            files: [],
            totalOccurrences: 0
          };
        }
        acc[key].files.push(change.file);
        acc[key].totalOccurrences += change.occurrences;
        return acc;
      }, {});
      
      for (const [change, info] of Object.entries(groupedChanges)) {
        console.log(`\n  ${change}`);
        console.log(`    Description: ${info.description}`);
        console.log(`    Occurrences: ${info.totalOccurrences}`);
        console.log(`    Files: ${info.files.length}`);
        
        if (info.files.length <= 5) {
          info.files.forEach(file => console.log(`      - ${file}`));
        } else {
          info.files.slice(0, 3).forEach(file => console.log(`      - ${file}`));
          console.log(`      ... and ${info.files.length - 3} more`);
        }
      }
    }
    
    console.log('\n✨ Migration completed!');
    
    if (this.totalChanges > 0) {
      console.log('\n💡 Next steps:');
      console.log('  1. Review the changes made');
      console.log('  2. Test your app to ensure everything works');
      console.log('  3. Commit the changes');
      console.log('\n⚠️  Note: Some changes might need manual review for context-specific usage');
    } else {
      console.log('\n🎉 No token migrations needed - your codebase is already up to date!');
    }
  }
}

// Dry run function
async function dryRun() {
  console.log('🔍 Running in dry-run mode (no files will be modified)\n');
  
  const migrator = new TokenMigrator();
  const files = await migrator.findFiles();
  
  console.log(`Would process ${files.length} files:`);
  files.forEach(file => console.log(`  - ${file}`));
  
  console.log('\nToken migrations that would be applied:');
  Object.entries(TOKEN_MIGRATIONS).forEach(([old, config]) => {
    console.log(`  ${old} → ${config.newToken} (${config.description})`);
  });
  
  console.log('\nTo run the actual migration, use: npm run migrate-tokens');
}

// CLI interface
if (require.main === module) {
  const isDryRun = process.argv.includes('--dry-run');
  
  if (isDryRun) {
    dryRun().catch(console.error);
  } else {
    const migrator = new TokenMigrator();
    migrator.migrate().catch(console.error);
  }
}

module.exports = { TokenMigrator, TOKEN_MIGRATIONS };