"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: result.error };
      }

      return { success: true };
    },
    []
  );

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push("/");
  }, [router]);

  const isAdmin = session?.user?.role === "admin";
  const isDonor = session?.user?.role === "donor";
  const isRecipient = session?.user?.role === "recipient";
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  return {
    session,
    status,
    user: session?.user,
    login,
    logout,
    isAdmin,
    isDonor,
    isRecipient,
    isAuthenticated,
    isLoading,
  };
}
