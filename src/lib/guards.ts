import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/auth-context";

export async function requireAuth(allowed?: AppRole[]) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw redirect({ to: "/login" });
  if (allowed && allowed.length) {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
    const roles = (data ?? []).map((r) => r.role as AppRole);
    if (!roles.some((r) => allowed.includes(r))) {
      throw redirect({ to: "/" });
    }
  }
}