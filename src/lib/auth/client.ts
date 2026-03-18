import { dashClient, sentinelClient } from "@better-auth/infra/client";
import { createAuthClient } from "better-auth/react";

const plugins = [];

if (process.env.NEXT_PUBLIC_BETTER_AUTH_INFRA_ENABLED === "true") {
  plugins.push(
    dashClient(),
    sentinelClient({
      autoSolveChallenge: true,
    })
  );
}

export const authClient = createAuthClient({
  plugins,
});

export const { signOut } = authClient;
