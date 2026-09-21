import { afterAll, afterEach, beforeAll } from "vitest";

import { mockWorker } from "../msw/browser";

beforeAll(() =>
  mockWorker.start({
    onUnhandledRequest(request, print) {
      if (new URL(request.url).pathname.startsWith("/api/")) {
        print.error();
      }
    },
    quiet: true,
  }),
);
afterEach(() => mockWorker.resetHandlers());
afterAll(() => mockWorker.stop());
