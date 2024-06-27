/**
  NOTE @rosschapman: Developers may be tempted to auto-generate types as described in the strapi docs using cli commands
  from the `@strapi/strapi` module, but I've noticed the output is funky for use in a client application in its raw form.
  For example, string fields from the recommended module are typed as `Attribute.String` but this type isn't compatible
  with `string` 🤦. Strapi offers this cumbersome approach to sync types, but also caveats this is not an official
  solution: https://strapi.io/blog/improve-your-frontend-experience-with-strapi-types-and-type-script. Even so, I don't
  trust this in view of the above example.
*/

import useSWR from "swr";
import fetcher from "utils/fetcher";
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
  return useStrapiHook<StrapiResponses.Footer>("footer?populate[links][populate]=*");
}

export function useNavigationData() {
  return useStrapiHook<StrapiResponses.Header>("header?populate[logo]=*&populate[navigation][populate]=*");
}

export namespace StrapiResponses {
  export interface Link {
    id: number;
    url: string;
    text: string;
  }

  export interface DynamicLink {
    id: number;
    // __component is a key used by Strapi
    // that may not have practical purposes for the frontend
    __component: string;
    title: string;
    link: Link[];
  }

  export interface Footer {
    address: string;
    email_address: string;
    phone_number: string;
    links: DynamicLink[];
  }

  export interface Header {
    logo: {
      data: {
        attributes: Logo;
      };
    };
    navigation: NavigationMenu[];
  };

  export interface Logo {
    name: string;
    alternativeText: string;
    caption: string;
    width: number;
    height: number;
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string;
    provider: string;
    createdAt: string;
    updatedAt: string;

    // TODO uknown types
    // provider_metadata: null;
    // formats: null;
  }

  export interface NavigationMenu {
    id: number;
    // The plurality mismatch here is a quirk of strapi's serialization of repeatable nested components
    link: Link[];
    title: string;
  }
}
