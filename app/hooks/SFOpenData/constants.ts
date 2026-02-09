/**
 * SF Open Data API endpoints and configuration
 */

export const SF_OPEN_DATA_BASE_URL = "https://data.sfgov.org/resource";

export const SF_OPEN_DATA_ENDPOINTS = {
  organizations: `${SF_OPEN_DATA_BASE_URL}/ddhd-yzyc.json`,
  services: `${SF_OPEN_DATA_BASE_URL}/ga45-xynq.json`,
  locations: `${SF_OPEN_DATA_BASE_URL}/rwbr-kbhe.json`,
  serviceAtLocation: `${SF_OPEN_DATA_BASE_URL}/my66-wiiw.json`,
  taxonomy: `${SF_OPEN_DATA_BASE_URL}/r7ep-tutk.json`,
  schedules: `${SF_OPEN_DATA_BASE_URL}/etrb-d3bg.json`,
} as const;

// Default pagination
export const DEFAULT_LIMIT = 100;
export const MAX_LIMIT = 1000;

// SWR configuration for SF Open Data
export const SF_OPEN_DATA_SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 1000 * 60 * 30, // 30 minutes
  dedupingInterval: 1000 * 60 * 5, // 5 minutes deduplication
};
