import useSWR from "swr";
import fetcher from "utils/fetcher";
import config from "../config";
import { type Footer, type StrapiResponse } from "models/Strapi";

interface SWRHookResult<T> {
  data: T;
  error?: Error;
  isLoading: boolean;
}

function createStrapiHook<T>(path: string): SWRHookResult<T> {
  const dataFetcher = () =>
    fetcher<StrapiResponse<T>>(`${config.STRAPI_API_URL}/api/${path}`, {
      Authorization: `Bearer ${config.STRAPI_API_TOKEN}`,
    });

  const { data, error, isLoading } = useSWR<StrapiResponse<T>>(
    "/api/footer",
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
