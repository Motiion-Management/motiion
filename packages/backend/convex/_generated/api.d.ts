/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated by convex@1.12.0.
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as agencies from "../agencies.js";
import type * as agents from "../agents.js";
import type * as clerk from "../clerk.js";
import type * as eventTypes from "../eventTypes.js";
import type * as events from "../events.js";
import type * as experiences from "../experiences.js";
import type * as featuredChoreographers from "../featuredChoreographers.js";
import type * as featuredContent from "../featuredContent.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as pointValues from "../pointValues.js";
import type * as resumes from "../resumes.js";
import type * as skills from "../skills.js";
import type * as training from "../training.js";
import type * as users from "../users.js";
import type * as util from "../util.js";
import type * as validators_attributes from "../validators/attributes.js";
import type * as validators_base from "../validators/base.js";
import type * as validators_resume from "../validators/resume.js";
import type * as validators_sizing from "../validators/sizing.js";

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
  agents: typeof agents;
  clerk: typeof clerk;
  eventTypes: typeof eventTypes;
  events: typeof events;
  experiences: typeof experiences;
  featuredChoreographers: typeof featuredChoreographers;
  featuredContent: typeof featuredContent;
  files: typeof files;
  http: typeof http;
  pointValues: typeof pointValues;
  resumes: typeof resumes;
  skills: typeof skills;
  training: typeof training;
  users: typeof users;
  util: typeof util;
  "validators/attributes": typeof validators_attributes;
  "validators/base": typeof validators_base;
  "validators/resume": typeof validators_resume;
  "validators/sizing": typeof validators_sizing;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
