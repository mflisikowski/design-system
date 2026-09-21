import { afterAll, afterEach, beforeAll, expect, test } from "vitest";

import { testHarnessEndpoint } from "../msw/handlers";
import { mockServer } from "../msw/server";

beforeAll(() => mockServer.listen({ onUnhandledRequest: "error" }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

test("serves deterministic responses from shared MSW handlers", async () => {
  const response = await fetch(testHarnessEndpoint);

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ status: "ready" });
});
