import { StrapiModels } from "models/Strapi";

export function extractNavigationMenusFromNavigationResponse(
  navigationResponse: StrapiModels.HeaderAttributes | null
): Array<Omit<StrapiModels.NavigationMenu, "__component">> | null {
  return (
    navigationResponse &&
    navigationResponse.navigation.map(({ __component, ...rest }) => rest)
  );
}

export function extractLogoFromNavigationResponse(
  navigationResponse: StrapiModels.HeaderAttributes | null
): StrapiModels.LogoAttributes | null {
  return navigationResponse && navigationResponse.logo.data.attributes;
}
