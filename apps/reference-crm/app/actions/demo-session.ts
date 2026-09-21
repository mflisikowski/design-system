"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { demoSessionCookie, demoSessionValue, safeReturnTo } from "@/lib/demo-session";

export async function continueDemoSession(returnTo: string) {
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  const hostname = requestHeaders.get("host")?.split(":")[0];
  cookieStore.set(demoSessionCookie, demoSessionValue, {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secure: hostname !== "localhost" && hostname !== "127.0.0.1",
  });
  redirect(safeReturnTo(returnTo));
}

export async function signOutDemoSession() {
  const cookieStore = await cookies();
  cookieStore.delete(demoSessionCookie);
  redirect("/sign-in");
}
