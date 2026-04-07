import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  appBaseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  enableConnectAccountEndpoint: true,
});

/**
 * Get a Management API token using client credentials
 */
async function getMgmtToken(): Promise<string> {
  const res = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
    }),
  });
  const data = await res.json();
  return data.access_token;
}

/**
 * Get the GitHub access token from the user's Auth0 identity
 */
export async function getGitHubToken(): Promise<string | null> {
  const session = await auth0.getSession();
  if (!session) return null;

  const mgmtToken = await getMgmtToken();
  const res = await fetch(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(session.user.sub)}?fields=identities&include_fields=true`,
    { headers: { Authorization: `Bearer ${mgmtToken}` } }
  );

  if (!res.ok) return null;

  const data = await res.json();
  const githubIdentity = data.identities?.find((id: any) => id.provider === "github");
  return githubIdentity?.access_token || null;
}
