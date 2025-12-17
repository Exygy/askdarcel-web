# Typesense Search Integration

This document explains how to use Typesense search in the AskDarcel application.

## Setup

### 1. Install Dependencies

Typesense client is already installed. If needed:

```bash
npm install typesense
```

### 2. Configure Environment

Add the following to your `config.yml`:

```yaml
TYPESENSE_HOST: "localhost" # or your Typesense server host
TYPESENSE_PORT: "8108" # Typesense server port
TYPESENSE_PROTOCOL: "http" # "http" for dev, "https" for production
TYPESENSE_API_KEY: "abc123" # Your Typesense API key
```

### 3. Switch to Typesense Provider

In `app/search/constants.ts`, change the active provider:

```typescript
export const ACTIVE_SEARCH_PROVIDER: SearchProviderType = "typesense";
```

## Usage

### Basic Text Search

```typescript
import { getSearchProvider } from "app/search";

const searchProvider = getSearchProvider();

// Simple text search
const results = await searchProvider.search({
  query: "community health",
  hitsPerPage: 20,
});

console.log(`Found ${results.nbHits} organizations`);
results.hits.forEach((hit) => {
  console.log(`${hit.name} - ${hit.description}`);
});
```

### Geographic Bounding Box Search

Search for organizations within a Google Maps viewport:

```typescript
import { getSearchProvider } from "app/search";
import { googleMapsBoundsToSearchConfig } from "app/search/providers/typesense";

const searchProvider = getSearchProvider();

// Get bounds from Google Map
const bounds = map.getBounds();

// Convert to search config format
const boundingBox = googleMapsBoundsToSearchConfig(bounds);

// Search within the map bounds
const results = await searchProvider.search({
  query: "*", // or any search term
  insideBoundingBox: [boundingBox],
});

console.log(`Found ${results.nbHits} organizations in viewport`);
```

### Combined Text + Geographic Search

Search for specific terms within a geographic area:

```typescript
import { getSearchProvider } from "app/search";
import { googleMapsBoundsToSearchConfig } from "app/search/providers/typesense";

const searchProvider = getSearchProvider();
const bounds = map.getBounds();
const boundingBox = googleMapsBoundsToSearchConfig(bounds);

const results = await searchProvider.search({
  query: "food bank",
  insideBoundingBox: [boundingBox],
  hitsPerPage: 50,
});
```

### Radius Search

Find organizations within a certain distance of a point:

```typescript
import { getSearchProvider } from "app/search";

const searchProvider = getSearchProvider();

// Search within 5km of a point
const results = await searchProvider.search({
  query: "*",
  aroundLatLng: "37.7749,-122.4194", // San Francisco coordinates
  aroundRadius: 5000, // 5000 meters = 5km
});

console.log(`Found ${results.nbHits} organizations within 5km`);

// Results are automatically sorted by distance from the point
```

### Pagination

```typescript
import { getSearchProvider } from "app/search";

const searchProvider = getSearchProvider();

// Get first page (page 0)
const page1 = await searchProvider.search({
  query: "healthcare",
  page: 0,
  hitsPerPage: 20,
});

// Get second page
const page2 = await searchProvider.search({
  query: "healthcare",
  page: 1,
  hitsPerPage: 20,
});

// Or use the built-in pagination
searchProvider.goToPage(2);
const state = searchProvider.getState();
console.log(`Current page: ${state.pagination.currentPage}`);
```

### Reactive State Updates

Subscribe to search state changes:

```typescript
import { getSearchProvider } from "app/search";

const searchProvider = getSearchProvider();

// Subscribe to state changes
const unsubscribe = searchProvider.subscribe((state) => {
  console.log("Search state updated:", {
    query: state.query,
    isSearching: state.isSearching,
    nbHits: state.results?.nbHits,
    error: state.error,
  });
});

// Perform searches
await searchProvider.search({ query: "housing" });

// Unsubscribe when done
unsubscribe();
```

### Using with React Components

```typescript
import { useEffect, useState } from "react";
import { getSearchProvider } from "app/search";
import type { SearchResults } from "app/search";

function SearchComponent() {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchProvider = getSearchProvider();

    const unsubscribe = searchProvider.subscribe((state) => {
      setResults(state.results);
      setIsLoading(state.isSearching);
    });

    return unsubscribe;
  }, []);

  const handleSearch = async (query: string, mapBounds: any) => {
    const searchProvider = getSearchProvider();
    const boundingBox = googleMapsBoundsToSearchConfig(mapBounds);

    await searchProvider.search({
      query,
      insideBoundingBox: [boundingBox],
      hitsPerPage: 40,
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (!results) return <div>No results</div>;

  return (
    <div>
      <h2>Found {results.nbHits} organizations</h2>
      {results.hits.map((hit) => (
        <div key={hit.id}>
          <h3>{hit.name}</h3>
          <p>{hit.description}</p>
          <p>Locations: {hit.location_count}</p>
        </div>
      ))}
    </div>
  );
}
```

### Switching Collections

The provider defaults to the `organizations` collection. To search services:

```typescript
import { getTypesenseProvider } from "app/search";

const provider = getTypesenseProvider();

// Switch to services collection
provider.setCollection("services");

const results = await provider.search({
  query: "mental health services",
});

// Switch back to organizations
provider.setCollection("organizations");
```

## Response Format

All search results follow the `SearchResults` interface:

```typescript
{
  hits: [
    {
      id: "123",
      name: "Community Health Center",
      type: "resource" | "service",
      _geoloc: { lat: 37.7749, lng: -122.4194 },
      description: "Providing healthcare services...",
      email: "info@example.org",
      website: "https://example.org",
      alternate_name: "CHC",
      locations: [[37.7749, -122.4194], [37.7849, -122.4094]],
      location_count: 2,
      // Plus highlighting and ranking info
    }
  ],
  nbHits: 42,              // Total results found
  page: 0,                 // Current page (0-indexed)
  nbPages: 3,              // Total pages
  hitsPerPage: 20,         // Results per page
  processingTimeMS: 2,     // Search execution time
  query: "health",         // The search query
  facets: {}               // Facet data (if requested)
}
```

## Important Notes

### Bounding Box Polygon

Typesense requires a **closed polygon** with 5 points for geographic searches. The helper functions handle this automatically, but if you're building filters manually:

```typescript
// Wrong (4 points, not closed)
"locations:(37.785,-122.410,37.785,-122.390,37.800,-122.390,37.800,-122.410)";

// Correct (5 points, closed polygon)
"locations:(37.785,-122.410,37.785,-122.390,37.800,-122.390,37.800,-122.410,37.785,-122.410)";
```

### Field Weighting

The provider automatically weights field searches:

- Organization name: 3x weight
- Description: 1x weight

This means matches in the name are 3x more relevant than matches in descriptions.

### Multiple Locations

Organizations can have multiple locations. If ANY location matches the geographic filter, the organization is returned. The primary location is used for the `_geoloc` field.

### Performance

- Text searches typically complete in 1-5ms
- Geographic searches may take 5-20ms depending on the area size
- Consider debouncing search input (300-500ms) for search-as-you-type

## Testing

Test your Typesense connection:

```bash
# Basic health check
curl "http://localhost:8108/health" \
  -H "X-TYPESENSE-API-KEY: abc123"

# Test search
curl "http://localhost:8108/collections/organizations/documents/search?q=health&query_by=name,description&query_by_weights=3,1" \
  -H "X-TYPESENSE-API-KEY: abc123"

# Test bounding box search
curl "http://localhost:8108/collections/organizations/documents/search?q=*&query_by=name&filter_by=locations:(37.785,-122.410,37.785,-122.390,37.800,-122.390,37.800,-122.410,37.785,-122.410)" \
  -H "X-TYPESENSE-API-KEY: abc123"
```

## Troubleshooting

### Connection Errors

```
Error: Could not connect to Typesense
```

**Solution:** Check that:

1. Typesense server is running
2. `TYPESENSE_HOST` and `TYPESENSE_PORT` are correct
3. `TYPESENSE_API_KEY` is valid

### No Results

```
Found 0 organizations
```

**Solution:**

1. Verify the collection has data: `curl http://localhost:8108/collections/organizations`
2. Check if the collection name is correct (default is "organizations")
3. For geographic searches, ensure the bounding box includes your test data

### Type Errors

```
Cannot find module 'typesense'
```

**Solution:** Run `npm install typesense`

## Migration from Algolia

The provider interface is identical, so switching from Algolia to Typesense only requires changing the `ACTIVE_SEARCH_PROVIDER` constant. All existing code using `getSearchProvider()` will work without changes.

## Production Deployment

When deploying to production:

1. Update `TYPESENSE_PROTOCOL` to `"https"`
2. Use a production Typesense host URL
3. Use a read-only (search-only) API key for frontend
4. Consider using a Typesense Cloud or self-hosted cluster for redundancy
5. Monitor search performance and adjust as needed

## Resources

- [Typesense Documentation](https://typesense.org/docs/latest/)
- [Typesense JS Client](https://github.com/typesense/typesense-js)
- [Geographic Search Guide](https://typesense.org/docs/latest/api/geosearch.html)
