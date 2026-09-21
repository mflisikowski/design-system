import { themeDefaults } from "@mflisikowski/tokens/runtime";

import { RegistrySample } from "@/components/ui/registry-sample";

export default function HomePage() {
  return (
    <main>
      <h1>MFD Reference CRM</h1>
      <RegistrySample
        brand={themeDefaults.brand}
        label="The reference application workspace is ready."
      />
    </main>
  );
}
