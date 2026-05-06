import { createFileRoute } from "@tanstack/react-router";
import { ProtectedShell } from "@/components/ProtectedShell";
import { AppShell } from "@/components/AppShell";
import { BarChart3 } from "lucide-react";

export const Route = createFileRoute("/gestor")({
  component: () => (
    <ProtectedShell allowed={["gestor"]}>
      <AppShell title="Dashboard Estratégico" items={[{ to: "/gestor", label: "Em breve", icon: BarChart3 }]}>
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
          KPIs, gráficos e exportação de relatórios chegarão na próxima fase.
        </div>
      </AppShell>
    </ProtectedShell>
  ),
});