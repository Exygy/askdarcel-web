// NOTE @rosschapman: Developers may be tempted to auto-generate types as described in the strapi docs but the
// output is not easily consumed by a client application in its raw form. For example, string fields from
// the recommended module `@strapi/strapi` are typed as `Attribute.String` but this type isn't compatible with
// `string` 🤦. Strapi offers this cumbersome approach for consideration, but also caveats this is not an official
// solution: https://strapi.io/blog/improve-your-frontend-experience-with-strapi-types-and-type-script. Although I
// don't trust this in view of the above example.

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
