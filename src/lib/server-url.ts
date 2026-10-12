// "https://shop.com/" and "https://shop.com" must compare equal: the CSRF check matches origins exactly
const toOrigin = (url: string): string => new URL(url).origin

// Public URL of this deployment. NEXT_PUBLIC_SERVER_URL is set for production; Vercel preview
// deployments fall back to their own URL so links (emails, Stripe redirects) point back at them.
export function getServerUrl (): string {
  if (process.env.NEXT_PUBLIC_SERVER_URL) return toOrigin(process.env.NEXT_PUBLIC_SERVER_URL)
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

// Origins allowed to make cookie-authenticated requests (Payload CSRF allowlist): this deployment
// under every URL Vercel serves it from. Extra domains (e.g. www + apex) should redirect to the primary one.
export function getTrustedOrigins (): string[] {
  const vercelHosts = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
    .filter((host): host is string => Boolean(host))
    .map((host) => `https://${host}`)
  return Array.from(new Set([getServerUrl(), ...vercelHosts]))
}

// Base URL for redirects back to the app (e.g. after Stripe Checkout): the origin the user is browsing when it's
// one of ours, so the session cookie (host-only) is still there when they come back; otherwise the server URL.
export function getRequestBaseUrl (headers: Headers): string {
  const origin = headers.get('Origin')
  return origin && getTrustedOrigins().includes(origin) ? origin : getServerUrl()
}
