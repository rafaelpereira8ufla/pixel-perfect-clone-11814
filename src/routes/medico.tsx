import { createFileRoute } from "@tanstack/react-router";
import { getRedirectTarget, requireAuth } from "@/lib/guards";
import { AppShell } from "@/components/AppShell";
import { Stethoscope } from "lucide-react";

export const Route = createFileRoute("/medico")({
  beforeLoad: async ({ location }) => { await requireAuth(getRedirectTarget(location), ["medico", "gestor"]); },
  component: () => (
    <AppShell title="Painel do Médico" items={[{ to: "/medico", label: "Em breve", icon: Stethoscope }]}>
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
        Painel do médico chegará na próxima fase: agenda diária, histórico do paciente e publicação de resultados.
      </div>
    </AppShell>
  ),
});