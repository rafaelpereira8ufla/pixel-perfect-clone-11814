import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/guards";
import { AppShell } from "@/components/AppShell";
import { BarChart3 } from "lucide-react";

export const Route = createFileRoute("/gestor")({
  beforeLoad: async ({ location }) => { await requireAuth(location.href, ["gestor"]); },
  component: () => (
    <AppShell title="Dashboard Estratégico" items={[{ to: "/gestor", label: "Em breve", icon: BarChart3 }]}>
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
        KPIs, gráficos e exportação de relatórios chegarão na próxima fase.
      </div>
    </AppShell>
  ),
});