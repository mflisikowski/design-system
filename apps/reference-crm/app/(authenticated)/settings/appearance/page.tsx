import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { AppearanceSettings } from "@/features/appearance/appearance-settings";

import "@/features/appearance/appearance-settings.css";

export default function AppearanceSettingsPage() {
  return (
    <section className="settings-page">
      <PageHeader
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/clients">Clients</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbCurrent>Appearance</BreadcrumbCurrent>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
        description="Choose the demo brand, color scheme, and density independently."
        title="Appearance"
      />
      <AppearanceSettings />
    </section>
  );
}
