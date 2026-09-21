import { setupServer } from "msw/node";

import { referenceCrmHandlers } from "./handlers";

export const mockServer = setupServer(...referenceCrmHandlers);
