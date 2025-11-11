import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { Configure } from "react-instantsearch-core";
import { AroundRadius } from "@algolia/client-search";

/**
 * SearchConfigContext - Centralized Search Configuration Manager
 *
 * PROBLEM: Previously, Sidebar and Configure components sent competing search requests,
 * causing race conditions and incorrect results.
 *
 * SOLUTION: This context provides a single source of truth for all search configuration.
 * - Collects config from pages (geo bounds, filters, pagination)
 * - Collects config from Sidebar refinements (categories, eligibilities, distance)
 * - Merges all config into ONE Configure component
 * - Eliminates race conditions by coordinating all parameters
 *
 * USAGE:
 * 1. Wrap your page component with <SearchConfigProvider>
 * 2. Call updateConfig() instead of rendering <Configure> directly
 * 3. SearchConfigProvider renders the merged <Configure> for you
 */

interface SearchConfig {
  // Geographic filters
  insideBoundingBox?: number[][];
  aroundLatLng?: string;
  aroundRadius?: AroundRadius;
  aroundPrecision?: number;
  minimumAroundRadius?: number;

  // Pagination
  hitsPerPage?: number;

  // Category filters
  filters?: string;

  // Any other Algolia configure props
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface SearchConfigContextValue {
  /**
   * Update the search configuration. This will merge with existing config
   * and trigger a single coordinated search request.
   */
  updateConfig: (config: Partial<SearchConfig>) => void;

  /**
   * Reset the configuration to empty state
   */
  resetConfig: () => void;

  /**
   * Current merged configuration
   */
  currentConfig: SearchConfig;
}

const SearchConfigContext = createContext<SearchConfigContextValue | undefined>(
  undefined
);

interface SearchConfigProviderProps {
  children: ReactNode;
  /**
   * Enable debug mode to log configuration changes
   */
  debug?: boolean;
  /**
   * Initial configuration to set immediately on mount
   * This prevents race conditions by ensuring Configure is set before searches fire
   */
  initialConfig?: Partial<SearchConfig>;
}

/**
 * SearchConfigProvider - Wraps search pages to provide centralized config management
 *
 * This component:
 * 1. Accepts config updates from child components via updateConfig()
 * 2. Merges all config into a single state object
 * 3. Renders ONE <Configure> component with the merged config
 * 4. Prevents race conditions by coordinating all search parameters
 */
export const SearchConfigProvider: React.FC<SearchConfigProviderProps> = ({
  children,
  debug = false,
  initialConfig = {},
}) => {
  const [config, setConfig] = useState<SearchConfig>(initialConfig);

  const updateConfig = useCallback(
    (newConfig: Partial<SearchConfig>) => {
      setConfig((prevConfig) => {
        const mergedConfig = { ...prevConfig, ...newConfig };

        if (debug) {
          // eslint-disable-next-line no-console
          console.log("[SearchConfig] Config updated:", {
            previous: prevConfig,
            new: newConfig,
            merged: mergedConfig,
            stackTrace: new Error().stack,
          });
        }

        return mergedConfig;
      });
    },
    [debug]
  );

  const resetConfig = useCallback(() => {
    if (debug) {
      // eslint-disable-next-line no-console
      console.log("[SearchConfig] Config reset");
    }
    setConfig({});
  }, [debug]);

  useEffect(() => {
    if (debug && Object.keys(config).length > 0) {
      // eslint-disable-next-line no-console
      console.log("[SearchConfig] Current config:", config);
    }
  }, [config, debug]);

  const contextValue: SearchConfigContextValue = {
    updateConfig,
    resetConfig,
    currentConfig: config,
  };

  return (
    <SearchConfigContext.Provider value={contextValue}>
      {/* This is the SINGLE Configure component that receives merged config from all sources */}
      <Configure maxValuesPerFacet={9999} {...config} />
      {children}
    </SearchConfigContext.Provider>
  );
};

/**
 * Hook to access search configuration context
 *
 * @throws Error if used outside of SearchConfigProvider
 */
export const useSearchConfig = (): SearchConfigContextValue => {
  const context = useContext(SearchConfigContext);
  if (context === undefined) {
    throw new Error(
      "useSearchConfig must be used within a SearchConfigProvider"
    );
  }
  return context;
};
