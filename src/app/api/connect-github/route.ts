import { auth0 } from "@/lib/auth0";

export async function GET() {
  // Force login through GitHub with explicit scopes
  return await auth0.startInteractiveLogin({
    authorizationParameters: {
      connection: "github",
      connection_scope: "repo,read:user",
    },
    returnTo: "/api/debug",
  });
}
