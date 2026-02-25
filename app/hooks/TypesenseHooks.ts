/**
 * React Hooks for interacting with Typesense directly
 */

import { useState, useEffect } from "react";
import config from "../config";

export interface CategoryFacet {
  value: string;
  count: number;
}

export interface SubcategoryFacet {
  value: string;
  count: number;
}

export interface EligibilityFacet {
  value: string;
  count: number;
}

export interface TypesenseFacets {
  categories: CategoryFacet[];
  subcategories: SubcategoryFacet[];
  eligibilities: EligibilityFacet[];
}

/**
 * Fetch categories and subcategories from Typesense facets
 *
 * This hook queries Typesense to get all unique categories and subcategories
 * that exist in the data, along with their counts.
 *
 * Returns null while loading, or the facets data once loaded.
 */
export const useTypesenseFacets = (): TypesenseFacets | null => {
  const [facets, setFacets] = useState<TypesenseFacets | null>(null);

  useEffect(() => {
    const fetchFacets = async () => {
      try {
        const url = `${config.TYPESENSE_PROTOCOL}://${config.TYPESENSE_HOST}:${
          config.TYPESENSE_PORT
        }/collections/resources/documents/search?${new URLSearchParams({
          q: "*",
          query_by: "name",
          facet_by: "categories,subcategories,eligibilities",
          filter_by: "locations:(0, 0, 20000 km)",
          per_page: "0",
          max_facet_values: "100",
        })}`;

        const response = await fetch(url, {
          headers: {
            "X-TYPESENSE-API-KEY": config.TYPESENSE_API_KEY,
          },
        });

        if (!response.ok) {
          throw new Error(`Typesense API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Extract facets from response
        const categoryCounts =
          data.facet_counts?.find(
            (f: { field_name: string }) => f.field_name === "categories"
          )?.counts || [];

        const subcategoryCounts =
          data.facet_counts?.find(
            (f: { field_name: string }) => f.field_name === "subcategories"
          )?.counts || [];

        const eligibilityCounts =
          data.facet_counts?.find(
            (f: { field_name: string }) => f.field_name === "eligibilities"
          )?.counts || [];

        setFacets({
          categories: categoryCounts.map(
            (c: { value: string; count: number }) => ({
              value: c.value,
              count: c.count,
            })
          ),
          subcategories: subcategoryCounts.map(
            (c: { value: string; count: number }) => ({
              value: c.value,
              count: c.count,
            })
          ),
          eligibilities: eligibilityCounts.map(
            (c: { value: string; count: number }) => ({
              value: c.value,
              count: c.count,
            })
          ),
        });
      } catch (error) {
        // Error fetching facets - set empty arrays
        setFacets({ categories: [], subcategories: [], eligibilities: [] });
      }
    };

    fetchFacets();
  }, []);

  return facets;
};

export interface TopLevelCategoriesResult {
  categories: CategoryFacet[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Fetch only top-level categories from Typesense
 *
 * A focused hook for the Browse Services section that only fetches
 * the categories facet, providing a cleaner API with loading and error states.
 */
export const useTopLevelCategories = (): TopLevelCategoriesResult => {
  const [categories, setCategories] = useState<CategoryFacet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const url = `${config.TYPESENSE_PROTOCOL}://${config.TYPESENSE_HOST}:${
          config.TYPESENSE_PORT
        }/collections/resources/documents/search?${new URLSearchParams({
          q: "*",
          query_by: "name",
          facet_by: "categories",
          filter_by: "locations:(0, 0, 20000 km)",
          per_page: "0",
          max_facet_values: "100",
        })}`;

        const response = await fetch(url, {
          headers: {
            "X-TYPESENSE-API-KEY": config.TYPESENSE_API_KEY,
          },
        });

        if (!response.ok) {
          throw new Error(`Typesense API error: ${response.statusText}`);
        }

        const data = await response.json();

        const categoryCounts =
          data.facet_counts?.find(
            (f: { field_name: string }) => f.field_name === "categories"
          )?.counts || [];

        setCategories(
          categoryCounts.map((c: { value: string; count: number }) => ({
            value: c.value,
            count: c.count,
          }))
        );
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch categories")
        );
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
};
