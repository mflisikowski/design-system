import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { continueDemoSession } from "@/app/actions/demo-session";
import { Button } from "@/components/ui/button";
import { demoSessionCookie, demoSessionValue, safeReturnTo } from "@/lib/demo-session";

type SignInPageProps = Readonly<{
  searchParams: Promise<{ returnTo?: string }>;
}>;

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const [cookieStore, parameters] = await Promise.all([cookies(), searchParams]);
  const returnTo = safeReturnTo(parameters.returnTo);

  if (cookieStore.get(demoSessionCookie)?.value === demoSessionValue) {
    redirect(returnTo);
  }

  const action = continueDemoSession.bind(null, returnTo);

  return (
    <main className="sign-in-page" id="main-content">
      <section aria-labelledby="sign-in-title" className="sign-in-card">
        <p className="eyebrow">Demo mode</p>
        <h1 id="sign-in-title">Welcome to Reference CRM</h1>
        <p>
          Explore a fictional client workspace as <strong>Alex Morgan — Account Manager</strong>. No
          credentials are required.
        </p>
        <p className="supporting-copy">
          All CRM records are fictional and remain in this browser&apos;s local storage.
        </p>
        <form action={action}>
          <Button size="lg" type="submit">
            Continue as demo manager
          </Button>
        </form>
      </section>
    </main>
  );
}
