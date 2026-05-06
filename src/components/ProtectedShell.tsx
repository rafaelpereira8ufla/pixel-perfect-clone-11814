import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import type { AppRole } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export function ProtectedShell({ children, allowed }: { children: ReactNode; allowed?: AppRole[] }) {
  const location = useLocation();
  const [status, setStatus] = useState<"checking" | "authorized" | "redirecting">("checking");

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      const target = `${location.pathname}${location.searchStr}${location.hash}`;
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setStatus("redirecting");
          window.location.assign(`/login?redirect=${encodeURIComponent(target)}`);
        }
        return;
      }

      if (allowed?.length) {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
        const roles = (data ?? []).map((row) => row.role as AppRole);

        if (!roles.some((role) => allowed.includes(role))) {
          if (!cancelled) {
            setStatus("redirecting");
            window.location.assign("/");
          }
          return;
        }
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