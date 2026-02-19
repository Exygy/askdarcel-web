import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Configure } from "react-instantsearch-core";
import { AroundRadius } from "@algolia/client-search";

/**
 * SearchConfigContext - Centralized search configuration manager.
 * Renders a single <Configure> component with merged config from all sources.
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
  /** Update search config (merges with existing) */
  updateConfig: (config: Partial<SearchConfig>) => void;
  /** Current merged configuration */
  currentConfig: SearchConfig;
}

const SearchConfigContext = createContext<SearchConfigContextValue | undefined>(
  undefined
);

interface SearchConfigProviderProps {
  children: ReactNode;
  /** Initial configuration to set on mount */
  initialConfig?: Partial<SearchConfig>;
}

export const SearchConfigProvider: React.FC<SearchConfigProviderProps> = ({
  children,
  initialConfig = {},
}) => {
  const [config, setConfig] = useState<SearchConfig>(initialConfig);

  const updateConfig = useCallback((newConfig: Partial<SearchConfig>) => {
    setConfig((prev) => {
      const merged = { ...prev, ...newConfig };
      // Remove keys explicitly set to undefined so they aren't passed
      // to <Configure> as undefined props (which can conflict with other
      // geo params, e.g. aroundLatLng vs insideBoundingBox).
      const next = Object.fromEntries(
        Object.entries(merged).filter(([, v]) => v !== undefined)
      ) as SearchConfig;

      // Shallow-compare to avoid unnecessary state updates.
      // A new object reference from Object.fromEntries would cause
      // <Configure> to re-render and fire a new search even when nothing
      // actually changed, which can trigger infinite render loops.
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(next);
      if (prevKeys.length === nextKeys.length) {
        const changed = nextKeys.some((key) => {
          const pv = prev[key];
          const nv = next[key];
          // Deep-compare arrays (e.g. insideBoundingBox) by value
          if (Array.isArray(pv) && Array.isArray(nv)) {
            return JSON.stringify(pv) !== JSON.stringify(nv);
          }
          return pv !== nv;
        });
        if (!changed) {
          return prev; // same reference → React skips re-render
        }
      }

      return next;
    });
  }, []);

  const contextValue: SearchConfigContextValue = {
    updateConfig,
    currentConfig: config,
  };

  return (
    <SearchConfigContext.Provider value={contextValue}>
      {Object.keys(config).length > 0 && (
        <Configure maxValuesPerFacet={9999} {...config} />
      )}
      {children}
    </SearchConfigContext.Provider>
  );
};

export const useSearchConfig = (): SearchConfigContextValue => {
  const context = useContext(SearchConfigContext);
  if (!context) {
    throw new Error("useSearchConfig must be used within SearchConfigProvider");
  }
  return context;
};
