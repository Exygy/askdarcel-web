import useSWR from "swr";
import fetcher from "utils/fetcher";
import { type Footer, type StrapiResponse } from "models/Strapi";
import config from "../config";

interface SWRHookResult<T> {
  data: T;
  error?: Error;
  isLoading: boolean;
}

// eslint-disable-next-line react-hooks/rules-of-hooks
function createStrapiHook<T>(path: string): SWRHookResult<T> {
  const dataFetcher = () =>
    fetcher<StrapiResponse<T>>(`${config.STRAPI_API_URL}/api/${path}`, {
      Authorization: `Bearer ${config.STRAPI_API_TOKEN}`,
    });

  const { data, error, isLoading } = useSWR<StrapiResponse<T>>(
    `/api/${path}`,
    dataFetcher
  );

  return {
    data: data?.data ? (data.data as any).attributes : null,
    error,
    isLoading,
  };
}

export function useFooterData() {
  return createStrapiHook<Footer>("footer?populate[links][populate]=*");
}