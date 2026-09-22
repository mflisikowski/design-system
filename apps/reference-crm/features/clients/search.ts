import type { Client } from "./model";

export function normalizeClientSearchQuery(value: string | null | undefined) {
  return (value ?? "").trim().replace(/\s+/gu, " ");
}

function normalizeSearchText(value: string) {
  return normalizeClientSearchQuery(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase();
}

export function clientMatchesSearch(client: Client, query: string) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return true;
  }

  return [client.organizationName, client.contactName, client.contactEmail].some((value) =>
    normalizeSearchText(value).includes(normalizedQuery),
  );
}
