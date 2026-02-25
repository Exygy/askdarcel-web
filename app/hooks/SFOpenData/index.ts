/**
 * SF Open Data API Hooks
 *
 * This module provides React hooks for fetching data from the SF Open Data API
 * (data.sfgov.org) for the SF social services directory.
 *
 * Usage:
 *   import { useService, useServiceDetails, useCategories } from "hooks/SFOpenData";
 *
 * Available hooks:
 *   - Organizations: useOrganization, useOrganizations
 *   - Services: useService, useServices, useOrganizationServices
 *   - Locations: useLocation, useLocations, useLocationsByIds, useOrganizationLocations
 *   - Service↔Location: useServiceLocations, useLocationServices
 *   - Taxonomy: useCategories, useEligibilities, useTopLevelCategories, useSubcategories, useAllEligibilities
 *   - Schedules: useServiceSchedules
 *   - Composite: useServiceDetails, useServiceWithOrganization
 */

// Types
export type {
  SFOrganization,
  SFService,
  SFLocation,
  SFServiceAtLocation,
  SFTaxonomy,
  SFSchedule,
  SFServiceWithDetails,
  SFOpenDataHookResult,
  SFServiceFilters,
  SFLocationFilters,
  SFTaxonomyFilters,
  SFTaxonomyLinkType,
  SFTaxonomyLinkEntity,
  SFOpenDataPoint,
} from "./types";

// Constants
export {
  SF_OPEN_DATA_BASE_URL,
  SF_OPEN_DATA_ENDPOINTS,
  SF_OPEN_DATA_SWR_CONFIG,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} from "./constants";

// SoQL utilities
export {
  buildSoQLUrl,
  buildIdFilter,
  buildIdsFilter,
  buildTextSearchFilter,
  buildEqualityFilter,
  combineFilters,
} from "./soqlUtils";

// Organization hooks
export { useOrganization, useOrganizations } from "./useOrganizations";

// Service hooks
export {
  useService,
  useServices,
  useOrganizationServices,
} from "./useServices";

// Location hooks
export {
  useLocation,
  useLocations,
  useLocationsByIds,
  useOrganizationLocations,
} from "./useLocations";

// Service↔Location join hooks
export {
  useServiceLocations,
  useLocationServices,
} from "./useServiceAtLocation";

// Taxonomy hooks (categories and eligibilities)
export {
  useCategories,
  useEligibilities,
  useTopLevelCategories,
  useSubcategories,
  useAllEligibilities,
} from "./useTaxonomy";

// Schedule hooks
export { useServiceSchedules } from "./useSchedules";

// Composite hooks
export {
  useServiceDetails,
  useServiceWithOrganization,
} from "./useServiceDetails";
export { useOrganizationDetails } from "./useOrganizationDetails";
export type { SFOrganizationWithDetails } from "./useOrganizationDetails";

// Transformers
export {
  transformSchedules,
  transformLocationToAddress,
  transformTaxonomyToCategory,
  transformTaxonomyToEligibility,
  transformOrganization,
  transformService,
  transformLocationsToLocationDetails,
  buildDetailActions,
} from "./transformers";
