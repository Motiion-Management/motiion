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
import type * as agencies from "../agencies.js";
import type * as ai_documentProcessor from "../ai/documentProcessor.js";
import type * as ai_fileMetadata from "../ai/fileMetadata.js";
import type * as ai_schemas from "../ai/schemas.js";
import type * as ai_shared from "../ai/shared.js";
import type * as ai_textParser from "../ai/textParser.js";
import type * as ai_utils from "../ai/utils.js";
import type * as clerk from "../clerk.js";
import type * as dev_resumeTest from "../dev/resumeTest.js";
import type * as events from "../events.js";
import type * as featuredMembers from "../featuredMembers.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as onboarding from "../onboarding.js";
import type * as onboardingConfig from "../onboardingConfig.js";
import type * as projects from "../projects.js";
import type * as training from "../training.js";
import type * as users_headshots from "../users/headshots.js";
import type * as users_headshotsOptimized from "../users/headshotsOptimized.js";
import type * as users_helpers from "../users/helpers.js";
import type * as users_projects from "../users/projects.js";
import type * as users_representation from "../users/representation.js";
import type * as users_resume from "../users/resume.js";
import type * as users_resumeImport from "../users/resumeImport.js";
import type * as users from "../users.js";
import type * as util from "../util.js";
import type * as validators_agencies from "../validators/agencies.js";
import type * as validators_attributes from "../validators/attributes.js";
import type * as validators_base from "../validators/base.js";
import type * as validators_events from "../validators/events.js";
import type * as validators_featuredMembers from "../validators/featuredMembers.js";
import type * as validators_projects from "../validators/projects.js";
import type * as validators_sizing from "../validators/sizing.js";
import type * as validators_training from "../validators/training.js";
import type * as validators_users from "../validators/users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  agencies: typeof agencies;
  "ai/documentProcessor": typeof ai_documentProcessor;
  "ai/fileMetadata": typeof ai_fileMetadata;
  "ai/schemas": typeof ai_schemas;
  "ai/shared": typeof ai_shared;
  "ai/textParser": typeof ai_textParser;
  "ai/utils": typeof ai_utils;
  clerk: typeof clerk;
  "dev/resumeTest": typeof dev_resumeTest;
  events: typeof events;
  featuredMembers: typeof featuredMembers;
  files: typeof files;
  http: typeof http;
  onboarding: typeof onboarding;
  onboardingConfig: typeof onboardingConfig;
  projects: typeof projects;
  training: typeof training;
  "users/headshots": typeof users_headshots;
  "users/headshotsOptimized": typeof users_headshotsOptimized;
  "users/helpers": typeof users_helpers;
  "users/projects": typeof users_projects;
  "users/representation": typeof users_representation;
  "users/resume": typeof users_resume;
  "users/resumeImport": typeof users_resumeImport;
  users: typeof users;
  util: typeof util;
  "validators/agencies": typeof validators_agencies;
  "validators/attributes": typeof validators_attributes;
  "validators/base": typeof validators_base;
  "validators/events": typeof validators_events;
  "validators/featuredMembers": typeof validators_featuredMembers;
  "validators/projects": typeof validators_projects;
  "validators/sizing": typeof validators_sizing;
  "validators/training": typeof validators_training;
  "validators/users": typeof validators_users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
