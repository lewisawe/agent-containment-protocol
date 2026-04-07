import { auth0 } from "@/lib/auth0";

export async function middleware(req: Request) {
  return auth0.middleware(req);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
