# Backend Migration Plan: "experiences" → "projects"

## Summary
This document outlines the complete migration plan for renaming the "experiences" table to "projects" in our Convex backend. This migration affects 15 files and requires careful coordination with frontend changes.

## Critical Files Requiring Changes

### 1. Core Schema and Validators
- **`/packages/backend/convex/schema.ts`** (Line 29)
  - Change table name: `experiences: Experiences.table.index('userId', ['userId'])`
- **`/packages/backend/convex/validators/experiences.ts`** (Full file rename + internal updates)
  - Rename file to `validators/projects.ts`  
  - Change Table constructor: `Table('experiences', ...)` → `Table('projects', ...)`
  - Update type exports: `ExperienceDoc` → `ProjectDoc`, etc.
  - Update zid references: `zid('experiences')` → `zid('projects')`

### 2. Main Function Files
- **`/packages/backend/convex/experiences.ts`** 
  - Rename to `projects.ts`
  - Update all imports and CRUD operations
- **`/packages/backend/convex/users/experiences.ts`**
  - Rename to `users/projects.ts`
  - Update all table queries, inserts, deletes
  - Update function return types: `v.id('experiences')` → `v.id('projects')`

### 3. AI Integration Files (Critical)
- **`/packages/backend/convex/ai/schemas.ts`** (Lines 2, 6, 22, 63-67, 84-122, 152)
  - Update import: `from '../validators/experiences'` → `from '../validators/projects'`
  - Update schema references throughout
- **`/packages/backend/convex/ai/shared.ts`** (Lines 3, 266, 276, 324, 334)
  - Update import and AI prompt templates
- **`/packages/backend/convex/users/resumeImport.ts`** (Lines 261, 263)  
  - Update table inserts and type references

### 4. User Integration Files
- **`/packages/backend/convex/validators/users.ts`** (Lines 24, 132)
  - Update resume schema: `experiences: z.array(zid('experiences'))` → `z.array(zid('projects'))`
  - Update constant: `EXPERIENCES: 'experiences'` → `PROJECTS: 'projects'`
- **`/packages/backend/convex/users/resume.ts`** (Lines 8-10, 28-44, 68-95)
  - Update imports and resume processing logic

### 5. Configuration Files
- **`/packages/backend/convex/onboardingConfig.ts`** (Lines 104-105, 168-169)
  - Update step references (may need frontend coordination)

### 6. Development/Test Files  
- **`/packages/backend/convex/dev/resumeTest.ts`** - Update test references
- **`/packages/backend/convex/ai/textParser.ts`** - Update AI parsing logic
- **`/packages/backend/convex/ai/documentProcessor.ts`** - Update document processing

## Migration Order (Critical for Safety)

### Phase 1: Validators and Core Schema
1. **Rename and update `validators/experiences.ts` → `validators/projects.ts`**
2. **Update `schema.ts` table definition**  
3. **Update `validators/users.ts` references**

### Phase 2: Main Function Files
4. **Rename and update `experiences.ts` → `projects.ts`**
5. **Rename and update `users/experiences.ts` → `users/projects.ts`** 
6. **Update `users/resume.ts` integration**

### Phase 3: AI Integration
7. **Update `ai/schemas.ts` (most complex)**
8. **Update `ai/shared.ts` prompts and validation**
9. **Update `users/resumeImport.ts` table operations**
10. **Update remaining AI files (`textParser.ts`, `documentProcessor.ts`)**

### Phase 4: Configuration and Tests
11. **Update `onboardingConfig.ts`**
12. **Update development/test files**

## Potential Issues Identified

1. **AI Prompt Dependencies**: The AI system has hardcoded field names in prompts that reference "experiences"
2. **Frontend Coupling**: Onboarding config changes may require frontend updates 
3. **Generated API**: The `_generated/api.d.ts` will automatically update but may break existing frontend imports
4. **Database Migration**: This plan covers code changes only - database migration strategy needed separately

## Type and Import Updates Required

- `ExperienceDoc` → `ProjectDoc`
- `ExperienceFormDoc` → `ProjectFormDoc` 
- `zExperiences` → `zProjects`
- `zExperiencesDoc` → `zProjectsDoc`
- All `import` statements referencing experiences files
- All `v.id('experiences')` → `v.id('projects')`
- All `.query('experiences')` → `.query('projects')`
- All `.insert('experiences', ...)` → `.insert('projects', ...)`

## Database Migration Strategy Using @convex-dev/migrations

### Key Limitation: Convex Does Not Support Direct Table Renames
**Important**: We must create a new "projects" table and copy data from "experiences" rather than renaming directly.

### Phase 0: Setup Migrations Component

#### Install and Configure
```bash
npm install @convex-dev/migrations
```

#### Create `convex.config.ts`:
```typescript
import { defineApp } from "convex/server";
import migrations from "@convex-dev/migrations/convex.config";

const app = defineApp();
app.use(migrations);
export default app;
```

### Phase 1: Parallel Table Strategy

Since Convex doesn't support direct table renames, we'll use a parallel table approach:

1. **Deploy schema with BOTH tables** (experiences + projects coexisting)
2. **Copy all data** from experiences → projects with ID mapping
3. **Update foreign key references** in other tables (users.resume.experiences)
4. **Deploy code changes** to use projects table
5. **Verify migration** completeness
6. **Remove experiences table** from schema (final cleanup)

### Phase 2: Migration Implementation

#### Create `convex/migrations/experiencesToProjects.ts`:
```typescript
import { migrations } from "@convex-dev/migrations";
import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";

// Step 1: Copy all experiences to projects table
export const copyExperiencesToProjects = migrations.define({
  table: "experiences",
  migrateOne: async (ctx, experience) => {
    // Check if already migrated (idempotency)
    const existing = await ctx.db
      .query("projects")
      .withIndex("by_userId", q => q.eq("userId", experience.userId))
      .filter(q => q.eq(q.field("title"), experience.title))
      .first();
    
    if (!existing) {
      // Copy to projects table, preserving all fields except system fields
      const { _id, _creationTime, ...data } = experience;
      await ctx.db.insert("projects", data);
    }
  },
  // Run in larger batches for efficiency
  batchSize: 100,
});

// Step 2: Create ID mapping for foreign key updates
export const createIdMapping = internalQuery({
  args: {},
  returns: v.array(v.object({
    oldId: v.id("experiences"),
    newId: v.id("projects")
  })),
  handler: async (ctx) => {
    const experiences = await ctx.db.query("experiences").collect();
    const mapping = [];
    
    for (const exp of experiences) {
      const project = await ctx.db
        .query("projects")
        .withIndex("by_userId", q => q.eq("userId", exp.userId))
        .filter(q => q.eq(q.field("title"), exp.title))
        .first();
      
      if (project) {
        mapping.push({ oldId: exp._id, newId: project._id });
      }
    }
    
    return mapping;
  }
});

// Step 3: Update user references
export const updateUserReferences = migrations.define({
  table: "users",
  migrateOne: async (ctx, user) => {
    if (!user.resume?.experiences || user.resume.experiences.length === 0) {
      return; // Skip users without experiences
    }
    
    // Get the ID mapping
    const mapping = await ctx.runQuery(internal.migrations.experiencesToProjects.createIdMapping);
    const idMap = new Map(mapping.map(m => [m.oldId, m.newId]));
    
    // Map old IDs to new IDs
    const newProjectIds = user.resume.experiences
      .map(expId => idMap.get(expId))
      .filter(Boolean); // Remove any unmapped IDs
    
    // Update user's resume with new project IDs
    await ctx.db.patch(user._id, {
      resume: {
        ...user.resume,
        experiences: newProjectIds // This will become "projects" in code changes
      }
    });
  },
  batchSize: 50, // Smaller batches for users since updates are more complex
});

// Master migration runner
export const runFullMigration = internalMutation({
  args: { dryRun: v.optional(v.boolean()) },
  returns: v.object({
    experiencesCopied: v.number(),
    usersUpdated: v.number(),
    errors: v.array(v.string())
  }),
  handler: async (ctx, { dryRun = false }) => {
    const errors = [];
    let experiencesCopied = 0;
    let usersUpdated = 0;
    
    try {
      // Run migrations in sequence
      if (!dryRun) {
        await migrations.runOne(ctx, "copyExperiencesToProjects");
        experiencesCopied = await ctx.db.query("projects").count();
        
        await migrations.runOne(ctx, "updateUserReferences");
        usersUpdated = await ctx.db.query("users")
          .filter(q => q.neq(q.field("resume.experiences"), undefined))
          .count();
      } else {
        // Dry run - just count
        experiencesCopied = await ctx.db.query("experiences").count();
        usersUpdated = await ctx.db.query("users")
          .filter(q => q.neq(q.field("resume.experiences"), undefined))
          .count();
      }
    } catch (error) {
      errors.push(error.message);
    }
    
    return { experiencesCopied, usersUpdated, errors };
  }
});
```

### Phase 3: Migration Verification

```typescript
// convex/migrations/verify.ts
export const verifyMigration = internalQuery({
  args: {},
  returns: v.object({
    experiencesCount: v.number(),
    projectsCount: v.number(),
    usersWithExperiences: v.number(),
    usersWithProjects: v.number(),
    unmappedExperiences: v.array(v.id("experiences")),
    isComplete: v.boolean()
  }),
  handler: async (ctx) => {
    const experiencesCount = await ctx.db.query("experiences").count();
    const projectsCount = await ctx.db.query("projects").count();
    
    // Check user references
    const usersWithExperiences = await ctx.db.query("users")
      .filter(q => q.neq(q.field("resume.experiences"), undefined))
      .count();
    
    // Find unmapped experiences
    const unmapped = [];
    const experiences = await ctx.db.query("experiences").collect();
    for (const exp of experiences) {
      const project = await ctx.db.query("projects")
        .withIndex("by_userId", q => q.eq("userId", exp.userId))
        .filter(q => q.eq(q.field("title"), exp.title))
        .first();
      if (!project) {
        unmapped.push(exp._id);
      }
    }
    
    return {
      experiencesCount,
      projectsCount,
      usersWithExperiences,
      usersWithProjects: usersWithExperiences, // Will be same after migration
      unmappedExperiences: unmapped,
      isComplete: experiencesCount === projectsCount && unmapped.length === 0
    };
  }
});
```

### Phase 4: Migration Execution Plan

1. **Test in Development**
   ```bash
   # Dry run first
   npx convex run migrations:experiencesToProjects:runFullMigration --dryRun true
   
   # Verify current state
   npx convex run migrations:verify:verifyMigration
   
   # Run actual migration
   npx convex run migrations:experiencesToProjects:runFullMigration
   
   # Verify completion
   npx convex run migrations:verify:verifyMigration
   ```

2. **Production Deployment Steps**
   - Deploy schema changes with BOTH tables
   - Run migration in production
   - Deploy code changes to use projects table
   - Verify all functionality
   - Remove experiences table from schema (final deployment)

### Phase 5: Rollback Strategy

If issues occur, we have several rollback points:

1. **Before code deployment**: Both tables exist, just delete projects table
2. **After code deployment**: Reverse the migration by copying projects → experiences
3. **Emergency**: Keep both tables and add compatibility layer to read from either

### Migration Checklist

#### Backend Migration (COMPLETED ✅)
- [x] Install @convex-dev/migrations component
- [x] Create convex.config.ts
- [x] Deploy schema with both tables
- [x] Create migration functions (migrations.ts)
- [x] Create projects validator (validators/projects.ts)
- [x] Create projects API endpoints (projects.ts, users/projects.ts)
- [x] Update user validator to accept both ID types during migration
- [x] Test migration in dev (41/43 experiences migrated)
- [x] Verify data integrity in dev

#### Frontend Migration (IN PROGRESS 🚧)
- [ ] Update frontend types and imports
- [ ] Update frontend API calls
- [ ] Update frontend components
- [ ] Test frontend changes

#### Production Deployment (PENDING ⏳)
- [ ] Deploy to production with both tables
- [ ] Run migration in production
- [ ] Verify production functionality
- [ ] Remove experiences table from schema
- [ ] Final deployment to clean up

## Frontend Migration Plan

### Overview
- **24 files** requiring updates across components, hooks, types, and configuration
- **3 directories** needing renaming
- **15+ API calls** requiring updates
- **30+ type imports** needing migration
- **5+ form metadata configurations** requiring updates

### Phase 1: Type Definitions and Configuration Files

#### 1.1 Core Type Files (FIRST PRIORITY)
- **`/apps/native/types/experiences.ts`** → **`/apps/native/types/projects.ts`**
  - Rename all interfaces: `BaseExperience` → `BaseProject`, etc.
  - Update type unions: `Experience` → `Project`
  - Change form state interfaces: `ExperienceFormState` → `ProjectFormState`

- **`/apps/native/config/experienceTypes.ts`** → **`/apps/native/config/projectTypes.ts`**
  - Update constants: `EXPERIENCE_TYPES` → `PROJECT_TYPES`
  - Rename helper functions: `getExperienceDisplay*` → `getProjectDisplay*`
  - **Intent Note**: Keep user-facing labels as "Experience" for UX consistency - users understand "Experience" better than "Project" in this context

#### 1.2 Form Metadata
- **`/apps/native/utils/convexFormMetadata.ts`**
  - Update metadata exports: `experienceMetadata` → `projectMetadata`
  - Rename all form configurations: `*ExperienceMetadata` → `*ProjectMetadata`
  - **Intent Note**: This file is the central registry for form field validation and metadata - critical for form generation

### Phase 2: Directory and Component Structure

#### 2.1 Directory Renaming
- **`/apps/native/components/experiences/`** → **`/apps/native/components/projects/`**
- **`/apps/native/app/app/onboarding/experiences/`** → **`/apps/native/app/app/onboarding/projects/`**
- **`/apps/native/app/app/(modals)/onboarding/review/experience/`** → **`/apps/native/app/app/(modals)/onboarding/review/project/`**

#### 2.2 Component Files (Rename + Content Updates)
- **`ExperienceCard.tsx`** → **`ProjectCard.tsx`**
  - **Intent**: Display card for individual project items in lists
- **`ExperienceEditForm.tsx`** → **`ProjectEditForm.tsx`**
  - **Intent**: Form component for editing existing projects
- **`ExperienceEditSheet.tsx`** → **`ProjectEditSheet.tsx`**
  - **Intent**: Bottom sheet wrapper for edit form
- **`ExperienceTypeSelector.tsx`** → **`ProjectTypeSelector.tsx`**
  - **Intent**: UI for selecting project type (TV/Film, Music Video, etc.)

#### 2.3 Component Internal Updates
Each component requires:
- Interface renames: `ExperienceCardProps` → `ProjectCardProps`
- Function renames: `ExperienceEditForm` → `ProjectEditForm`
- Type imports from backend: `Doc<'experiences'>` → `Doc<'projects'>`
- API calls: `api.experiences.*` → `api.projects.*`
- Variable names: `experience` → `project`, `exp` → `proj`

### Phase 3: API Integration Updates

#### 3.1 Backend API Calls (7 locations)
- **Query calls:**
  - `api.users.experiences.getMyExperiences` → `api.users.projects.getMyProjects`
  - `api.users.experiences.getMyRecentExperiences` → `api.users.projects.getMyRecentProjects`
- **Mutation calls:**
  - `api.users.experiences.addMyExperience` → `api.users.projects.addMyProject`
  - `api.experiences.update` → `api.projects.update`
  - `api.experiences.destroy` → `api.projects.destroy`

#### 3.2 Type Imports (10+ locations)
- **Backend validators:**
  - `ExperienceFormDoc` → `ProjectFormDoc`
  - `zExperiencesDoc` → `zProjectsDoc`
  - `EXPERIENCE_TITLE_MAP` → `PROJECT_TITLE_MAP`
- **Generated types:**
  - `Id<'experiences'>` → `Id<'projects'>`
  - `Doc<'experiences'>` → `Doc<'projects'>`

### Phase 4: Application Routes and Navigation

#### 4.1 Route File Updates (3 files)
- **`/app/onboarding/experiences/index.tsx`** → **`/app/onboarding/projects/index.tsx`**
  - **Intent**: Main onboarding screen for adding projects during setup
- **`/app/onboarding/review/experiences.tsx`** → Update to reference projects
  - **Intent**: Review screen showing all projects before completing onboarding
- **`/app/(modals)/onboarding/review/experience/[id].tsx`** → **`.../project/[id].tsx`**
  - **Intent**: Modal for editing individual project during review phase

#### 4.2 Navigation Hook Updates (2 files)
- **`useOnboardingGroupFlow.ts`**: Update `experiences` group to `projects`
  - **Intent**: Controls multi-step onboarding flow grouping
- **`useSimpleOnboardingFlow.ts`**: Update `experiences` step references
  - **Intent**: Simplified linear onboarding flow

#### 4.3 Registry and Configuration (2 files)
- **`onboarding/registry.ts`**: Update step definitions
  - **Intent**: Central registry for all onboarding steps and their metadata

### Phase 5: Data Display and Resume Components

#### 5.1 Home and Resume Components (3 files)
- **`components/home/RecentlyAddedSection.tsx`**
  - API calls: `getMyRecentExperiences` → `getMyRecentProjects`
  - Helper functions: `getExperienceDisplay*` → `getProjectDisplay*`
  - **Intent**: Shows recently added projects on home screen for quick access
  
- **`components/resume/ParsedResumeReview.tsx`**
  - Type imports and display logic updates
  - **Intent**: Shows AI-parsed resume data for user review before import
  
- **`components/resume/ResumeImportStatus.tsx`**
  - Status message updates ("work experience" → "work projects")
  - **Intent**: Progress indicator during resume parsing

#### 5.2 Form Integration (2 files)
- **`components/forms/onboarding/PlaceholderForms.tsx`**
  - **Intent**: Placeholder forms used during development/testing
- **`components/dev/DevOnboardingTools.tsx`**
  - **Intent**: Development tools for testing onboarding flows

### Phase 6: Validation and Utility Updates

#### 6.1 Client-Side Validation
- **`hooks/useClientSideValidation.ts`**: Update field path references
  - **Intent**: Provides real-time validation feedback before server submission

## UX Decisions and Context

### User-Facing Text Strategy
- **UI Labels**: Keep "Experience" in user-facing text for familiarity
  - **Rationale**: Users in the entertainment industry understand "Experience" as their work history
- **Internal Code**: Use "Project" for consistency with new data model
  - **Rationale**: Better represents the discrete nature of entertainment industry work
- **Placeholders**: Update to "Project" where contextually appropriate
- **Help Text**: Review and update to use "project" terminology where it improves clarity

### Form Field Labels
- Type selector: "PROJECT TYPE" (already implemented in some places)
- Placeholders: "Project title", but keep "Add your experience here" for user familiarity

## Production Migration Instructions

### After Merge (Automatic Deployment)
Once this PR is merged, the production deployment will automatically include:
- Both `experiences` and `projects` tables in the schema
- Migration functions ready to run
- New API endpoints for projects
- Frontend code that uses the new projects APIs

### Manual Migration Steps Required

#### Step 1: Verify Deployment
```bash
# Check migration status in production
npx convex run --prod migrations:verifyMigration
```

Expected output should show experiences ready to migrate:
- `experiencesCount`: Number of experiences in production
- `projectsCount`: Should be 0 initially
- `isComplete`: Should be false

#### Step 2: Run Data Migration
```bash
# Run the full migration in production
npx convex run --prod migrations:runFullMigration

# Or run in steps for more control:
# 1. Copy experiences to projects
npx convex run --prod migrations:copyExperiencesToProjects

# 2. Update user references
npx convex run --prod migrations:updateUserReferences
```

#### Step 3: Verify Migration Success
```bash
# Check final status
npx convex run --prod migrations:verifyMigration
```

Success criteria:
- `projectsCount` should equal `experiencesCount`
- `usersWithProjects` should equal `usersWithExperiences`
- `unmappedExperiences` should be empty array
- `isComplete` should be true (or close if there are duplicates)

#### Step 4: Monitor Application
- Check that all features work correctly
- Monitor for any errors in Convex dashboard
- Test key user flows:
  - Viewing projects/experiences
  - Adding new projects
  - Editing existing projects
  - Resume import functionality

#### Step 5: Cleanup (After Verification)
Once everything is verified working:
1. Remove `experiences` table from schema
2. Update user validator to only accept project IDs
3. Remove backward compatibility exports
4. Deploy final cleanup

### Rollback Plan
If issues occur after migration:

1. **Data still intact**: Both tables exist, so old code can still read from experiences
2. **Reverse migration**: Copy data back from projects to experiences if needed
3. **Code rollback**: Revert the PR to restore old code

### Important Notes
- The migration is idempotent - running it multiple times is safe
- Duplicate titles in experiences may not migrate (by design to avoid duplicates)
- User references are updated to point to new project IDs
- Frontend uses backward-compatible APIs during transition

## Implementation Context for Future Work

### Critical Dependencies
1. **Type System**: All frontend types derive from backend validators - must update backend first
2. **API Generation**: Convex auto-generates API types - frontend will break until updated
3. **Form Metadata**: Central to all form rendering - update early to prevent cascading issues
4. **Navigation**: File-based routing means directory renames affect URLs

### Testing Focus Areas
1. **Onboarding Flow**: Complete dancer/choreographer flows end-to-end
2. **Project Management**: Add, edit, delete operations
3. **Review Screens**: Project display and editing in review phase
4. **Resume Import**: AI-parsed project data handling
5. **Navigation**: All route transitions and deep links

### Common Pitfalls to Avoid
- Don't forget to update imports in files that weren't directly searched
- Remember that Convex generates types - some errors only appear after backend deploys
- Form metadata drives validation - mismatches cause silent failures
- Navigation hooks control flow - broken references cause infinite loops

This migration affects 15 backend files and 24 frontend files, representing core user functionality.