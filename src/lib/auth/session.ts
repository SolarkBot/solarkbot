import { auth } from ".";

export async function getAuthSession(request: Request) {
  return auth.api.getSession({
    headers: request.headers,
  });
}

export async function getSessionWalletAddress(request: Request) {
  const session = await getAuthSession(request);
  return session?.user?.name ?? null;
}
