import type { ReactNode } from "react";
import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { useAuth, type AppRole } from "@/lib/auth-context";

export function ProtectedShell({ children, allowed }: { children: ReactNode; allowed?: AppRole[] }) {
  const location = useLocation();
  const { user, roles, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      const target = `${location.pathname}${location.searchStr}${location.hash}`;
      window.location.assign(`/login?redirect=${encodeURIComponent(target)}`);
      return;
    }

    if (allowed?.length && !roles.some((role) => allowed.includes(role))) {
      window.location.assign("/");
    }
  }, [allowed, loading, location.hash, location.pathname, location.searchStr, roles, user]);

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Carregando...</div>;
  }

  if (allowed?.length && !roles.some((role) => allowed.includes(role))) {
    return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Redirecionando...</div>;
  }

  return <>{children}</>;
}