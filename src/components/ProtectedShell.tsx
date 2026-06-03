import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import type { AppRole } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export function ProtectedShell({ children, allowed }: { children: ReactNode; allowed?: AppRole[] }) {
  const location = useLocation();
  const [status, setStatus] = useState<"checking" | "authorized">("checking");

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      const target = `${location.pathname}${location.searchStr}${location.hash}`;
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;

      if (!user) {
        if (!cancelled) {
          window.location.assign(`/login?redirect=${encodeURIComponent(target)}`);
        }
        return;
      }

      if (allowed?.length) {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
        const roles = (data ?? []).map((row) => row.role as AppRole);

        if (!roles.some((role) => allowed.includes(role))) {
          if (!cancelled) {
            window.location.assign("/");
          }
          return;
        }
      }

      // Força troca de senha no primeiro acesso
      const { data: profile } = await supabase
        .from("profiles")
        .select("must_change_password")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.must_change_password && location.pathname !== "/alterar-senha") {
        if (!cancelled) {
          window.location.assign("/alterar-senha");
        }
        return;
      }

      if (!cancelled) {
        setStatus("authorized");
      }
    };

    void checkAccess();

    return () => {
      cancelled = true;
    };
  }, [allowed, location.hash, location.pathname, location.searchStr]);

  if (status !== "authorized") {
    return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Carregando...</div>;
  }

  return <>{children}</>;
}