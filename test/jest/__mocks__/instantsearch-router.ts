// Mock for instantsearch.js/es/lib/routers
export const history = () => ({
  read: () => ({}),
  write: () => {},
  createURL: () => "",
  parseURL: () => ({}),
  onUpdate: () => {},
  dispose: () => {},
});

export default { history };
