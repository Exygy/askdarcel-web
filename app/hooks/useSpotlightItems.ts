import useSWR from "swr";
import fetcher from "utils/fetcher";
import { getTypesenseProvider } from "../search/providers/typesense/TypesenseProvider";
import type { Address, SearchHit } from "../search/types";
import type { SpotlightItem } from "models/Strapi";
import { SF_OPEN_DATA_ENDPOINTS } from "./SFOpenData/constants";
import { buildFieldInFilter, buildSoQLUrl } from "./SFOpenData/soqlUtils";
import type {
  SFLocation,
  SFOrganization,
  SFService,
  SFServiceAtLocation,
} from "./SFOpenData/types";

type ExternalLinkItem = Extract<
  SpotlightItem,
  { __component: "spotlight.external-link" }
>;

export type SpotlightEntry =
  | { kind: "resource"; hit: SearchHit }
  | { kind: "link"; item: ExternalLinkItem };

const fetchWhere = <T>(endpoint: string, where: string, limit: number) =>
  fetcher<T[]>(buildSoQLUrl(endpoint, { where, limit, order: "id" }));

const toAddress = (location: SFLocation): Address => ({
  address_1: location.address_1 ?? "",
  address_2: location.address_2,
  city: location.city ?? "",
  state_province: location.state_province ?? "",
  postal_code: location.postal_code,
  latitude: location.latitude ?? "",
  longitude: location.longitude ?? "",
});

const loadSpotlightItems = async (
  items: SpotlightItem[],
  district: number | null
): Promise<SpotlightEntry[]> => {
  const serviceIds = items.flatMap((item) =>
    item.__component === "spotlight.service-item"
      ? [item.service_id.trim()]
      : []
  );
  const organizationIds = items.flatMap((item) =>
    item.__component === "spotlight.organization-item"
      ? [item.organization_id.trim()]
      : []
  );

  const [services, serviceAtLocations] = serviceIds.length
    ? await Promise.all([
      fetchWhere<SFService>(
        SF_OPEN_DATA_ENDPOINTS.services,
        buildFieldInFilter("id", serviceIds),
        serviceIds.length
      ),
      fetchWhere<SFServiceAtLocation>(
        SF_OPEN_DATA_ENDPOINTS.serviceAtLocation,
        buildFieldInFilter("service_id", serviceIds),
        1000
      ),
    ])
    : [[], []];

  const allOrganizationIds = Array.from(
    new Set([...organizationIds, ...services.map((s) => s.organization_id)])
  );
  const locationFilters = [
    serviceAtLocations.length > 0 &&
    buildFieldInFilter(
      "id",
      serviceAtLocations.map((link) => link.location_id)
    ),
    organizationIds.length > 0 &&
    buildFieldInFilter("organization_id", organizationIds),
  ].filter(Boolean);

  const [organizations, locations] = await Promise.all([
    allOrganizationIds.length
      ? fetchWhere<SFOrganization>(
        SF_OPEN_DATA_ENDPOINTS.organizations,
        buildFieldInFilter("id", allOrganizationIds),
        allOrganizationIds.length
      )
      : [],
    locationFilters.length
      ? fetchWhere<SFLocation>(
        SF_OPEN_DATA_ENDPOINTS.locations,
        locationFilters.join(" OR "),
        1000
      )
      : [],
  ]);

  const organizationById = new Map(organizations.map((o) => [o.id, o]));
  const locationById = new Map(locations.map((l) => [l.id, l]));
  const inDistrict = (location: SFLocation) =>
    !district || location.supervisor_district === String(district);
  const usable = (list: SFLocation[]) =>
    list.filter((l) => l.latitude && l.longitude && inDistrict(l));

  const provider = getTypesenseProvider();
  const entries: SpotlightEntry[] = [];

  const addResource = (
    base: Omit<SearchHit, "_geoloc" | "locations" | "addressDisplay">,
    itemLocations: SFLocation[]
  ) => {
    const kept = usable(itemLocations);
    // With a district set, resources with no location in it are left out.
    if (district && kept.length === 0) return;
    const doc = { ...base, addresses: kept.map(toAddress) };
    entries.push({
      kind: "resource",
      hit: {
        ...doc,
        _geoloc: { lat: 0, lng: 0 },
        locations: provider.extractLocationsFromGeoloc(
          kept.map((l) => [Number(l.latitude), Number(l.longitude)]),
          entries.length + 1,
          doc.addresses
        ),
        addressDisplay: provider.computeAddressDisplay(doc),
      },
    });
  };

  items.forEach((item) => {
    if (item.__component === "spotlight.external-link") {
      entries.push({ kind: "link", item });
      return;
    }
    // Resources removed from the data are left out.
    if (item.__component === "spotlight.service-item") {
      const id = item.service_id.trim();
      const service = services.find((s) => s.id === id);
      if (!service) return;
      const organization = organizationById.get(service.organization_id);
      addResource(
        {
          id: `service-${service.id}`,
          type: "service",
          service_id: service.id as unknown as number,
          name: service.name,
          description: service.description,
          organization_id: service.organization_id,
          organization_name: organization?.name,
          organization_website: organization?.website,
        },
        serviceAtLocations
          .filter((link) => link.service_id === id)
          .flatMap((link) => locationById.get(link.location_id) ?? [])
      );
      return;
    }
    const id = item.organization_id.trim();
    const organization = organizationById.get(id);
    if (!organization) return;
    addResource(
      {
        id: `organization-${organization.id}`,
        type: "organization" as SearchHit["type"],
        name: organization.name,
        description: organization.description,
        organization_id: organization.id,
        organization_website: organization.website,
      },
      locations.filter((l) => l.organization_id === id)
    );
  });
  return entries;
};

export function useSpotlightItems(
  items: SpotlightItem[] | undefined,
  district: number | null | undefined
) {
  const { data, error, isLoading } = useSWR(
    items ? ["spotlight-items", JSON.stringify(items), district ?? null] : null,
    () => loadSpotlightItems(items as SpotlightItem[], district ?? null)
  );
  return { data: data ?? null, error, isLoading };
}
