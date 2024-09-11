// These types of array utilities are exceedingly difficult to notate with types. Developers are either
// welcome to the challenge or can apply the correct notations in consumers.

// Return unique elements of an object array based on key
export function uniqBy<T>(arr: T[], key: keyof T): T[] {
  return Object.values(
    arr.reduce(
      (map, item) => ({
        ...map,
        [`${item[key]}`]: item,
      }),
      {}
    )
  );
}

export function invert<T extends Record<string, string>>(object: T) {
  const result: Record<string, string> = {};
  Object.keys(object).forEach((key) => {
    const value = object[key];
    result[value] = key;
  });

  return result;
}
