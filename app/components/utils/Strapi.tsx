import { StrapiModels } from "models/Strapi";

export function extractNavigationMenus(
  rootData: StrapiModels.HeaderAttributes | null
): Array<Omit<StrapiModels.NavigationMenu, "__component">> | null {
  return (
    rootData && rootData.navigation.map(({ __component, ...rest }) => rest)
  );
}

export function extractLogo(
  rootData: StrapiModels.HeaderAttributes | null
): StrapiModels.LogoAttributes | null {
  return rootData && rootData.logo.data.attributes;
}
