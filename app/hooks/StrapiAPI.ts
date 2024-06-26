import useSWR from "swr";
import fetcher from "utils/fetcher";
import { StrapiModels } from "models/Strapi";
import config from "../config";

export interface StrapiResponse<T> {
  data: {
    id: number;
    attributes: T;
    meta: {
      [key: string]: string;
    };
  } | null;
}

interface SWRHookResult<T> {
  data: T | null;
  error?: Error;
  isLoading: boolean;
}

function useStrapiHook<T>(path: string): SWRHookResult<T> {
  const dataFetcher = () =>
    fetcher<StrapiResponse<T>>(`${config.STRAPI_API_URL}/api/${path}`, {
      Authorization: `Bearer ${config.STRAPI_API_TOKEN}`,
    });

  const { data, error, isLoading } = useSWR<StrapiResponse<T>>(
    `/api/${path}`,
    dataFetcher
  );

  return {
    data: data?.data ? data.data.attributes : null,
    error,
    isLoading,
  };
}

export function useFooterData() {
  return useStrapiHook<StrapiModels.FooterAttributes>("footer?populate[links][populate]=*");
}

export function useNavigationData() {
  return useStrapiHook<StrapiModels.HeaderAttributes>("header?populate[logo]=*&populate[navigation][populate]=*");
}
