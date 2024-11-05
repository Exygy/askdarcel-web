interface Options {
  [key: string]: any;
}
export function createSearchClient(options: Options) {
  return {
    search: (requests: any) =>
      Promise.resolve({
        results: requests.map(() => ({
          hits: [],
          page: 0,
          nbHits: 0,
          nbPages: 0,
          hitsPerPage: 0,
          processingTimeMS: 1,
          params: "",
          query: "",
          ...options,
        })),
      }),
  };
}
