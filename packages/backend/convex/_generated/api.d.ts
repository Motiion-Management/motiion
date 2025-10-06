/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin_runMigrations from "../admin/runMigrations.js";
import type * as agencies from "../agencies.js";
import type * as ai_documentProcessor from "../ai/documentProcessor.js";
import type * as ai_fileMetadata from "../ai/fileMetadata.js";
import type * as ai_schemas from "../ai/schemas.js";
import type * as ai_shared from "../ai/shared.js";
import type * as ai_textParser from "../ai/textParser.js";
import type * as ai_utils from "../ai/utils.js";
import type * as choreographers from "../choreographers.js";
import type * as clerk from "../clerk.js";
import type * as dancers from "../dancers.js";
import type * as dev_resumeTest from "../dev/resumeTest.js";
import type * as events from "../events.js";
import type * as featuredMembers from "../featuredMembers.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as migrations_autoMigrateAndCleanup from "../migrations/autoMigrateAndCleanup.js";
import type * as migrations_migrateDates from "../migrations/migrateDates.js";
import type * as migrations_migrateUsersToDancers from "../migrations/migrateUsersToDancers.js";
import type * as migrations_populateProfileIds from "../migrations/populateProfileIds.js";
import type * as onboarding from "../onboarding.js";
import type * as onboardingConfig from "../onboardingConfig.js";
import type * as profiles_common from "../profiles/common.js";
import type * as projects from "../projects.js";
import type * as schemas_agencies from "../schemas/agencies.js";
import type * as schemas_attributes from "../schemas/attributes.js";
import type * as schemas_base from "../schemas/base.js";
import type * as schemas_choreographers from "../schemas/choreographers.js";
import type * as schemas_dancers from "../schemas/dancers.js";
import type * as schemas_events from "../schemas/events.js";
import type * as schemas_featuredMembers from "../schemas/featuredMembers.js";
import type * as schemas_projects from "../schemas/projects.js";
import type * as schemas_sizing from "../schemas/sizing.js";
import type * as schemas_training from "../schemas/training.js";
import type * as schemas_users from "../schemas/users.js";
import type * as training from "../training.js";
import type * as users_headshots from "../users/headshots.js";
import type * as users_headshotsOptimized from "../users/headshotsOptimized.js";
import type * as users_helpers from "../users/helpers.js";
import type * as users_profileHelpers from "../users/profileHelpers.js";
import type * as users_projects from "../users/projects.js";
import type * as users_representation from "../users/representation.js";
import type * as users_resume from "../users/resume.js";
import type * as users_resumeImport from "../users/resumeImport.js";
import type * as users_users from "../users/users.js";
import type * as util from "../util.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "admin/runMigrations": typeof admin_runMigrations;
  agencies: typeof agencies;
  "ai/documentProcessor": typeof ai_documentProcessor;
  "ai/fileMetadata": typeof ai_fileMetadata;
  "ai/schemas": typeof ai_schemas;
  "ai/shared": typeof ai_shared;
  "ai/textParser": typeof ai_textParser;
  "ai/utils": typeof ai_utils;
  choreographers: typeof choreographers;
  clerk: typeof clerk;
  dancers: typeof dancers;
  "dev/resumeTest": typeof dev_resumeTest;
  events: typeof events;
  featuredMembers: typeof featuredMembers;
  files: typeof files;
  http: typeof http;
  "migrations/autoMigrateAndCleanup": typeof migrations_autoMigrateAndCleanup;
  "migrations/migrateDates": typeof migrations_migrateDates;
  "migrations/migrateUsersToDancers": typeof migrations_migrateUsersToDancers;
  "migrations/populateProfileIds": typeof migrations_populateProfileIds;
  onboarding: typeof onboarding;
  onboardingConfig: typeof onboardingConfig;
  "profiles/common": typeof profiles_common;
  projects: typeof projects;
  "schemas/agencies": typeof schemas_agencies;
  "schemas/attributes": typeof schemas_attributes;
  "schemas/base": typeof schemas_base;
  "schemas/choreographers": typeof schemas_choreographers;
  "schemas/dancers": typeof schemas_dancers;
  "schemas/events": typeof schemas_events;
  "schemas/featuredMembers": typeof schemas_featuredMembers;
  "schemas/projects": typeof schemas_projects;
  "schemas/sizing": typeof schemas_sizing;
  "schemas/training": typeof schemas_training;
  "schemas/users": typeof schemas_users;
  training: typeof training;
  "users/headshots": typeof users_headshots;
  "users/headshotsOptimized": typeof users_headshotsOptimized;
  "users/helpers": typeof users_helpers;
  "users/profileHelpers": typeof users_profileHelpers;
  "users/projects": typeof users_projects;
  "users/representation": typeof users_representation;
  "users/resume": typeof users_resume;
  "users/resumeImport": typeof users_resumeImport;
  "users/users": typeof users_users;
  util: typeof util;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
