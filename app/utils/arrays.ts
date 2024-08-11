// These types of array utilities are exceedingly difficult to notate with types. Developers are either
// welcome to the challenge or can apply the correct notations in consumers.
// @ts-nocheck

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

export function invert<T>(object: T) {
  const result = {};
  Object.keys(object).forEach((key) => {
    let value = object[key];
    if (value != null && typeof value.toString !== "function") {
      value = toString.call(value);
    }
    result[value] = key;
  });
  return result;
}

export function sortBy(key) {
  // eslint-disable-next-line no-nested-ternary
  return (a, b) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0);
}

export function minBy(collection, key) {
  // slower because need to create a lambda function for each call...
  const select = (a, b) => (a[key] <= b[key] ? a : b);
  return collection.reduce(select, {});
}
