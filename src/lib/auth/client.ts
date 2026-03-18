"use client";

import { useEffect, useState } from "react";

interface AuthSessionResponse {
  session: {
    token: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
  } | null;
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
}

function useSession() {
  const [data, setData] = useState<AuthSessionResponse | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/session", {
          cache: "no-store",
        });
        const payload = await response.json().catch(() => null);

        if (!cancelled) {
          setData(payload);
        }
      } catch {
        if (!cancelled) {
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setIsPending(false);
        }
      }
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isPending };
}

export const authClient = {
  useSession,
};

export async function signOut() {
  await fetch("/api/session/sign-out", {
    method: "POST",
  }).catch(() => null);
}
