// Mock for instantsearch.js/es/lib/routers
export const history = () => ({
  read: () => ({}),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  write: () => {},
  createURL: () => "",
  parseURL: () => ({}),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onUpdate: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  dispose: () => {},
});

export default { history };
