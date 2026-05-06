import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/auth-context";

export function getRedirectTarget(location: {
  pathname: string;
  searchStr?: string;
  hash?: string;
}) {
  return `${location.pathname}${location.searchStr ?? ""}${location.hash ?? ""}`;
}

export async function requireAuth(locationHref: string, allowed?: AppRole[]) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw redirect({
      to: "/login",
      search: { redirect: locationHref },
    });
  }

  if (allowed && allowed.length) {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const roles = (data ?? []).map((r) => r.role as AppRole);
    if (!roles.some((r) => allowed.includes(r))) {
      throw redirect({ to: "/" });
    }
  }
}