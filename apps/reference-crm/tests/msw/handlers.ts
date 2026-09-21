import { HttpResponse, http } from "msw";

export const testHarnessPath = "/api/testing/health";
export const testHarnessEndpoint = new URL(testHarnessPath, "http://localhost").href;

export const referenceCrmHandlers = [
  http.get(`*${testHarnessPath}`, () => HttpResponse.json({ status: "ready" })),
];
