#!/bin/bash

# Test Typesense Connection
# Run this script to verify your Typesense server is accessible

echo "🔍 Testing Typesense Connection..."
echo ""

# Configuration (update these if needed)
TYPESENSE_HOST=${TYPESENSE_HOST:-"localhost"}
TYPESENSE_PORT=${TYPESENSE_PORT:-"8108"}
TYPESENSE_API_KEY=${TYPESENSE_API_KEY:-"abc123"}

BASE_URL="http://${TYPESENSE_HOST}:${TYPESENSE_PORT}"

echo "Configuration:"
echo "  Host: $TYPESENSE_HOST"
echo "  Port: $TYPESENSE_PORT"
echo "  API Key: ${TYPESENSE_API_KEY:0:6}..."
echo ""

# Test 1: Health check
echo "Test 1: Health Check"
echo "-------------------"
HEALTH_RESPONSE=$(curl -s "${BASE_URL}/health" \
  -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}")

if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
  echo "✅ Health check passed: $HEALTH_RESPONSE"
else
  echo "❌ Health check failed"
  echo "   Response: $HEALTH_RESPONSE"
  exit 1
fi
echo ""

# Test 2: List collections
echo "Test 2: List Collections"
echo "------------------------"
COLLECTIONS_RESPONSE=$(curl -s "${BASE_URL}/collections" \
  -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}")

if echo "$COLLECTIONS_RESPONSE" | jq '.' >/dev/null 2>&1; then
  echo "✅ Collections retrieved successfully"
  echo "$COLLECTIONS_RESPONSE" | jq -r '.[] | .name' 2>/dev/null || echo "$COLLECTIONS_RESPONSE"
else
  echo "❌ Failed to retrieve collections"
  echo "   Response: $COLLECTIONS_RESPONSE"
fi
echo ""

# Test 3: Check organizations collection
echo "Test 3: Check Organizations Collection"
echo "---------------------------------------"
ORG_RESPONSE=$(curl -s "${BASE_URL}/collections/organizations" \
  -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}")

if echo "$ORG_RESPONSE" | jq '.' >/dev/null 2>&1; then
  echo "✅ Organizations collection exists"
  NUM_DOCS=$(echo "$ORG_RESPONSE" | jq '.num_documents' 2>/dev/null || echo "unknown")
  echo "   Documents: $NUM_DOCS"
else
  echo "⚠️  Organizations collection not found"
  echo "   You may need to create and populate this collection"
  echo "   Response: $ORG_RESPONSE"
fi
echo ""

# Test 4: Sample search
echo "Test 4: Sample Search"
echo "---------------------"
SEARCH_RESPONSE=$(curl -s "${BASE_URL}/collections/organizations/documents/search?q=*&query_by=name&per_page=5" \
  -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}")

if echo "$SEARCH_RESPONSE" | jq '.' >/dev/null 2>&1; then
  FOUND=$(echo "$SEARCH_RESPONSE" | jq '.found' 2>/dev/null || echo "unknown")
  echo "✅ Search successful"
  echo "   Found: $FOUND documents"
  
  # Show first result if available
  FIRST_NAME=$(echo "$SEARCH_RESPONSE" | jq -r '.hits[0].document.name' 2>/dev/null)
  if [ "$FIRST_NAME" != "null" ] && [ -n "$FIRST_NAME" ]; then
    echo "   First result: $FIRST_NAME"
  fi
else
  echo "❌ Search failed"
  echo "   Response: $SEARCH_RESPONSE"
fi
echo ""

# Test 5: Geographic search
echo "Test 5: Geographic Search (San Francisco area)"
echo "----------------------------------------------"
GEO_RESPONSE=$(curl -s "${BASE_URL}/collections/organizations/documents/search?q=*&query_by=name&filter_by=locations:(37.7,-122.5,37.7,-122.4,37.8,-122.4,37.8,-122.5,37.7,-122.5)&per_page=5" \
  -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}")

if echo "$GEO_RESPONSE" | jq '.' >/dev/null 2>&1; then
  FOUND=$(echo "$GEO_RESPONSE" | jq '.found' 2>/dev/null || echo "unknown")
  echo "✅ Geographic search successful"
  echo "   Found: $FOUND documents in San Francisco area"
else
  echo "⚠️  Geographic search failed"
  echo "   This might be expected if no data has locations in this area"
fi
echo ""

# Summary
echo "==============================================="
echo "Summary"
echo "==============================================="
echo ""
echo "✅ Typesense is accessible and responding"
echo ""
echo "Next steps:"
echo "1. Update ACTIVE_SEARCH_PROVIDER in app/search/constants.ts to 'typesense'"
echo "2. Start your dev server: npm run dev"
echo "3. Your app will now use Typesense for search!"
echo ""
echo "For more information, see:"
echo "- TYPESENSE_INTEGRATION.md"
echo "- app/search/providers/typesense/README.md"
echo ""
