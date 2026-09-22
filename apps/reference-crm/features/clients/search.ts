import { clientRelationshipStatusSchema, type Client, type ClientRelationshipStatus } from "./model";

export type ClientFilterStatus = ClientRelationshipStatus | "all";

export function normalizeClientRelationshipStatus(
  value: string | null | undefined,
): ClientRelationshipStatus | undefined {
  const result = clientRelationshipStatusSchema.safeParse(value);
  return result.success ? result.data : undefined;
}

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
