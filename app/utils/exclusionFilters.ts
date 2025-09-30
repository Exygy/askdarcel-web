/**
 * Creates Algolia filter strings to exclude resources based on Our415 business rules.
 * Resources are filtered out if they contain ONLY certain restricted eligibility categories.
 */

export const createExclusionFilters = (): string => {
  const filters = [];

  // Rule 1: ONLY elderly, maturing adult, senior, and/or "I am a senior" in age category
  const ageOnlyFilters = [
    'NOT (eligibilities:"elderly" AND eligibilities_count:1)',
    'NOT (eligibilities:"maturing adult" AND eligibilities_count:1)',
    'NOT (eligibilities:"senior" AND eligibilities_count:1)',
    'NOT (eligibilities:"I am a Senior" AND eligibilities_count:1)',
    // Combinations of these age categories only
    'NOT (eligibilities:"elderly" AND eligibilities:"senior" AND eligibilities_count:2)',
    'NOT (eligibilities:"elderly" AND eligibilities:"I am a Senior" AND eligibilities_count:2)',
    'NOT (eligibilities:"senior" AND eligibilities:"I am a Senior" AND eligibilities_count:2)',
    'NOT (eligibilities:"maturing adult" AND eligibilities:"senior" AND eligibilities_count:2)',
    'NOT (eligibilities:"maturing adult" AND eligibilities:"elderly" AND eligibilities_count:2)',
    'NOT (eligibilities:"maturing adult" AND eligibilities:"I am a Senior" AND eligibilities_count:2)',
    // Three combinations
    'NOT (eligibilities:"elderly" AND eligibilities:"senior" AND eligibilities:"I am a Senior" AND eligibilities_count:3)',
    'NOT (eligibilities:"elderly" AND eligibilities:"maturing adult" AND eligibilities:"senior" AND eligibilities_count:3)',
    'NOT (eligibilities:"elderly" AND eligibilities:"maturing adult" AND eligibilities:"I am a Senior" AND eligibilities_count:3)',
    'NOT (eligibilities:"maturing adult" AND eligibilities:"senior" AND eligibilities:"I am a Senior" AND eligibilities_count:3)',
    // All four
    'NOT (eligibilities:"elderly" AND eligibilities:"maturing adult" AND eligibilities:"senior" AND eligibilities:"I am a Senior" AND eligibilities_count:4)',
  ];

  // Rule 2: ONLY retired in employment status category
  filters.push('NOT (eligibilities:"retired" AND eligibilities_count:1)');

  // Rule 3: ONLY married with no children in family status category
  filters.push(
    'NOT (eligibilities:"married with no children" AND eligibilities_count:1)'
  );

  // Rule 4: ONLY men in gender category AND no TAY (18-24) in age category
  filters.push(
    'NOT (eligibilities:"men" AND eligibilities_count:1 AND NOT eligibilities:"TAY (18-24)")'
  );

  // Rule 5: ONLY Alzheimers and/or people who use drugs in health concerns category
  const healthOnlyFilters = [
    'NOT (eligibilities:"Alzheimers" AND eligibilities_count:1)',
    'NOT (eligibilities:"people who use drugs" AND eligibilities_count:1)',
    'NOT (eligibilities:"Alzheimers" AND eligibilities:"people who use drugs" AND eligibilities_count:2)',
  ];

  return [...filters, ...ageOnlyFilters, ...healthOnlyFilters].join(" AND ");
};
