export const demoSessionCookie = "mfd-demo-session";
export const demoSessionValue = "alex-morgan";

export function safeReturnTo(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/clients";
  }

  return value;
}
