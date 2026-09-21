import type { ReactNode } from "react";

import { signOutDemoSession } from "@/app/actions/demo-session";
import { PrimaryNavigation } from "@/components/app-shell/primary-navigation";
import { Button } from "@/components/ui/button";

type AuthenticatedLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="app-header">
        <div className="product-identity">
          <strong>Reference CRM</strong>
          <span className="demo-badge">Demo mode</span>
        </div>
        <PrimaryNavigation />
        <div className="session-controls">
          <span>Alex Morgan — Account Manager</span>
          <form action={signOutDemoSession}>
            <Button size="sm" type="submit" variant="ghost">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main className="app-main" id="main-content" tabIndex={-1}>
        {children}
      </main>
    </>
  );
}
