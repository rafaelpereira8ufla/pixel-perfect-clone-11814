import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
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
  const syncIdRef = useRef(0);

  const loadRoles = async (uid: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    setRoles((data ?? []).map((r) => r.role as AppRole));
  };

  const syncAuthState = async (nextSession: Session | null) => {
    const syncId = ++syncIdRef.current;

    setSession(nextSession);
    setUser(nextSession?.user ?? null);

    if (nextSession?.user) {
      setLoading(true);
      try {
        await loadRoles(nextSession.user.id);
      } catch {
        if (syncIdRef.current === syncId) {
          setRoles([]);
        }
      } finally {
        if (syncIdRef.current === syncId) {
          setLoading(false);
        }
      }
      return;
    }

    if (syncIdRef.current === syncId) {
      setRoles([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      void syncAuthState(s);
    });

    void supabase.auth.getSession().then(({ data: { session: s } }) => {
      void syncAuthState(s);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

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