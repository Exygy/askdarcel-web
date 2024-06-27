export namespace StrapiModels {
  export interface StrapiResponse<T> {
    data: {
      id: number;
      attributes: T;
      meta: {
        [key: string]: string;
      };
    } | null;
  }

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

  export interface FooterAttributes {
    address: string;
    email_address: string;
    phone_number: string;
    links: DynamicLink[];
  }

  export interface HeaderAttributes {
    logo: {
      data: {
        attributes: LogoAttributes;
      };
    };
    navigation: NavigationMenu[];
    // createdAt: Attribute.DateTime;
    // updatedAt: Attribute.DateTime;
    // publishedAt: Attribute.DateTime;
    // createdBy: Attribute.Relation<
    //   'api::header.header',
    //   'oneToOne',
    //   'admin::user'
    // > &
    // Attribute.Private;
    // updatedBy: Attribute.Relation<
    //   'api::header.header',
    //   'oneToOne',
    //   'admin::user'
    // > &
    // Attribute.Private;
  };

  export interface LogoAttributes {
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
    __component: "navigation.menu";
    title: string;
  }
}


