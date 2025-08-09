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
import type * as agents from "../agents.js";
import type * as clerk from "../clerk.js";
import type * as eventTypes from "../eventTypes.js";
import type * as events from "../events.js";
import type * as experiences_commercials from "../experiences/commercials.js";
import type * as experiences_liveperformances from "../experiences/liveperformances.js";
import type * as experiences_musicvideos from "../experiences/musicvideos.js";
import type * as experiences_tvfilm from "../experiences/tvfilm.js";
import type * as experiences_tvfilmForms from "../experiences/tvfilmForms.js";
import type * as experiences from "../experiences.js";
import type * as featuredContent from "../featuredContent.js";
import type * as featuredMembers from "../featuredMembers.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as onboarding from "../onboarding.js";
import type * as onboardingAnalysis from "../onboardingAnalysis.js";
import type * as onboardingConfig from "../onboardingConfig.js";
import type * as onboardingFlows from "../onboardingFlows.js";
import type * as rewards from "../rewards.js";
import type * as schemas_clientZid from "../schemas/clientZid.js";
import type * as schemas_experiencesCommercials from "../schemas/experiencesCommercials.js";
import type * as schemas_experiencesLivePerformances from "../schemas/experiencesLivePerformances.js";
import type * as schemas_experiencesMusicVideos from "../schemas/experiencesMusicVideos.js";
import type * as schemas_experiencesTvFilm from "../schemas/experiencesTvFilm.js";
import type * as schemas_index from "../schemas/index.js";
import type * as seedOnboardingFlows from "../seedOnboardingFlows.js";
import type * as training from "../training.js";
import type * as users_allExperiences from "../users/allExperiences.js";
import type * as users_experiences from "../users/experiences.js";
import type * as users_headshots from "../users/headshots.js";
import type * as users_headshotsOptimized from "../users/headshotsOptimized.js";
import type * as users_helpers from "../users/helpers.js";
import type * as users_representation from "../users/representation.js";
import type * as users_resume from "../users/resume.js";
import type * as users from "../users.js";
import type * as util from "../util.js";
import type * as validators_agencies from "../validators/agencies.js";
import type * as validators_agents from "../validators/agents.js";
import type * as validators_attributes from "../validators/attributes.js";
import type * as validators_base from "../validators/base.js";
import type * as validators_eventTypes from "../validators/eventTypes.js";
import type * as validators_events from "../validators/events.js";
import type * as validators_experiences from "../validators/experiences.js";
import type * as validators_experiencesCommercials from "../validators/experiencesCommercials.js";
import type * as validators_experiencesLivePerformances from "../validators/experiencesLivePerformances.js";
import type * as validators_experiencesMusicVideos from "../validators/experiencesMusicVideos.js";
import type * as validators_experiencesTvFilm from "../validators/experiencesTvFilm.js";
import type * as validators_featuredContent from "../validators/featuredContent.js";
import type * as validators_featuredMembers from "../validators/featuredMembers.js";
import type * as validators_onboardingFlows from "../validators/onboardingFlows.js";
import type * as validators_rewards from "../validators/rewards.js";
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
  agents: typeof agents;
  clerk: typeof clerk;
  eventTypes: typeof eventTypes;
  events: typeof events;
  "experiences/commercials": typeof experiences_commercials;
  "experiences/liveperformances": typeof experiences_liveperformances;
  "experiences/musicvideos": typeof experiences_musicvideos;
  "experiences/tvfilm": typeof experiences_tvfilm;
  "experiences/tvfilmForms": typeof experiences_tvfilmForms;
  experiences: typeof experiences;
  featuredContent: typeof featuredContent;
  featuredMembers: typeof featuredMembers;
  files: typeof files;
  http: typeof http;
  onboarding: typeof onboarding;
  onboardingAnalysis: typeof onboardingAnalysis;
  onboardingConfig: typeof onboardingConfig;
  onboardingFlows: typeof onboardingFlows;
  rewards: typeof rewards;
  "schemas/clientZid": typeof schemas_clientZid;
  "schemas/experiencesCommercials": typeof schemas_experiencesCommercials;
  "schemas/experiencesLivePerformances": typeof schemas_experiencesLivePerformances;
  "schemas/experiencesMusicVideos": typeof schemas_experiencesMusicVideos;
  "schemas/experiencesTvFilm": typeof schemas_experiencesTvFilm;
  "schemas/index": typeof schemas_index;
  seedOnboardingFlows: typeof seedOnboardingFlows;
  training: typeof training;
  "users/allExperiences": typeof users_allExperiences;
  "users/experiences": typeof users_experiences;
  "users/headshots": typeof users_headshots;
  "users/headshotsOptimized": typeof users_headshotsOptimized;
  "users/helpers": typeof users_helpers;
  "users/representation": typeof users_representation;
  "users/resume": typeof users_resume;
  users: typeof users;
  util: typeof util;
  "validators/agencies": typeof validators_agencies;
  "validators/agents": typeof validators_agents;
  "validators/attributes": typeof validators_attributes;
  "validators/base": typeof validators_base;
  "validators/eventTypes": typeof validators_eventTypes;
  "validators/events": typeof validators_events;
  "validators/experiences": typeof validators_experiences;
  "validators/experiencesCommercials": typeof validators_experiencesCommercials;
  "validators/experiencesLivePerformances": typeof validators_experiencesLivePerformances;
  "validators/experiencesMusicVideos": typeof validators_experiencesMusicVideos;
  "validators/experiencesTvFilm": typeof validators_experiencesTvFilm;
  "validators/featuredContent": typeof validators_featuredContent;
  "validators/featuredMembers": typeof validators_featuredMembers;
  "validators/onboardingFlows": typeof validators_onboardingFlows;
  "validators/rewards": typeof validators_rewards;
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
