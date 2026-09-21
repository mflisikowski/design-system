import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { demoSessionCookie, demoSessionValue } from "@/lib/demo-session";

export default async function HomePage() {
  const cookieStore = await cookies();
  redirect(
    cookieStore.get(demoSessionCookie)?.value === demoSessionValue ? "/clients" : "/sign-in",
  );
}
