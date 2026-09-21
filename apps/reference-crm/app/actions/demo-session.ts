"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { demoSessionCookie, demoSessionValue, safeReturnTo } from "@/lib/demo-session";

export async function continueDemoSession(returnTo: string) {
  const cookieStore = await cookies();
  cookieStore.set(demoSessionCookie, demoSessionValue, {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secure: true,
  });
  redirect(safeReturnTo(returnTo));
}

export async function signOutDemoSession() {
  const cookieStore = await cookies();
  cookieStore.delete(demoSessionCookie);
  redirect("/sign-in");
}
