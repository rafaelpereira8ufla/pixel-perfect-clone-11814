import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Activity, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function AppShell({ items, title, children }: { items: NavItem[]; title: string; children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-64 border-r border-border bg-sidebar text-sidebar-foreground flex-col hidden md:flex">
        <div className="h-16 px-5 border-b border-sidebar-border flex items-center gap-2 font-semibold">
          <span className="grid place-items-center h-8 w-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Activity className="h-4 w-4" />
          </span>
          Saúde Total
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((it) => {
            const active = pathname === it.to || pathname.startsWith(it.to + "/");
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border text-xs text-muted-foreground truncate">
          {user?.email}
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold">{title}</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await signOut();
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    agendado: "bg-info/15 text-[oklch(0.4_0.15_230)] border-info/30",
    confirmado: "bg-success/15 text-[oklch(0.4_0.15_155)] border-success/30",
    cancelado: "bg-destructive/15 text-destructive border-destructive/30",
    realizado: "bg-muted text-muted-foreground border-border",
    link_enviado: "bg-purple/15 text-[oklch(0.4_0.18_295)] border-purple/30",
  };
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs capitalize", map[status] ?? "bg-muted")}>
      {status.replace("_", " ")}
    </span>
  );
}