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

// @ts-ignore
export function invert(object) {
  const result = {};
  Object.keys(object).forEach((key) => {
    const value = object[key];
    // @ts-ignore
    result[value] = key;
  });

  return result;
}
