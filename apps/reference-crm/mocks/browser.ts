import { setupWorker } from "msw/browser";

import {
  createBrowserClientStorage,
  createClientHandlers,
} from "@/features/clients/mock-api";
import {
  createBrowserProjectStorage,
  createProjectHandlers,
} from "@/features/projects/mock-api";
import { deterministicProjects } from "@/features/projects/seed";

let startPromise: Promise<ServiceWorkerRegistration | undefined> | undefined;

export function startMockApi() {
  if (!startPromise) {
    const clientStorage = createBrowserClientStorage(window.localStorage);
    const projectStorage = createBrowserProjectStorage(window.localStorage);
    const worker = setupWorker(
      ...createClientHandlers(clientStorage, undefined, () =>
        projectStorage.write(deterministicProjects),
      ),
      ...createProjectHandlers(projectStorage, clientStorage),
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
