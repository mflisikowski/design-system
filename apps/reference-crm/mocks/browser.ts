import { setupWorker } from "msw/browser";

import { createBrowserClientStorage, createClientHandlers } from "@/features/clients/mock-api";

let startPromise: Promise<ServiceWorkerRegistration | undefined> | undefined;

export function startMockApi() {
  if (!startPromise) {
    const worker = setupWorker(
      ...createClientHandlers(createBrowserClientStorage(window.localStorage)),
    );
    startPromise = worker.start({
      onUnhandledRequest(request, print) {
        if (new URL(request.url).pathname.startsWith("/api/")) {
          print.error();
        }
      },
      quiet: true,
      serviceWorker: {
        url: "/mockServiceWorker.js",
      },
    });
  }

  return startPromise;
}
