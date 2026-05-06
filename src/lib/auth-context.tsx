import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "paciente" | "recepcionista" | "medico" | "gestor";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoles = async (uid: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    setRoles((data ?? []).map((r) => r.role as AppRole));
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    void supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const syncRoles = async () => {
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
        if (!cancelled) {
          setRoles((data ?? []).map((r) => r.role as AppRole));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void syncRoles();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const value: AuthCtx = {
    user,
    session,
    roles,
    loading,
    signOut: async () => {
      await supabase.auth.signOut();
    },
    refreshRoles: async () => {
      if (user) await loadRoles(user.id);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
};

export const primaryRoute = (roles: AppRole[]): string => {
  if (roles.includes("gestor")) return "/gestor";
  if (roles.includes("medico")) return "/medico";
  if (roles.includes("recepcionista")) return "/recepcao";
  return "/paciente";
};