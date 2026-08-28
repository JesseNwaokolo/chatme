export const contactKeys = {
  all: ["contacts"] as const,
  match: (phoneNumbers: string[]) => [...contactKeys.all, "match", phoneNumbers] as const,
  search: (query: string) => [...contactKeys.all, "search", query] as const,
};
