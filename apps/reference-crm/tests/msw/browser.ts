import { setupWorker } from "msw/browser";

import { referenceCrmHandlers } from "./handlers";

export const mockWorker = setupWorker(...referenceCrmHandlers);
