export function shouldUseSecureCookies() {
  return process.env.NODE_ENV === "production" && process.env.MFD_E2E_INSECURE_HTTP_COOKIES !== "1";
}
