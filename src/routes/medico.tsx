import { createFileRoute } from "@tanstack/react-router";
import { ProtectedShell } from "@/components/ProtectedShell";
import { AppShell } from "@/components/AppShell";
import { Stethoscope } from "lucide-react";

export const Route = createFileRoute("/medico")({
  component: () => (
    <ProtectedShell allowed={["medico", "gestor"]}>
      <AppShell title="Painel do Médico" items={[{ to: "/medico", label: "Em breve", icon: Stethoscope }]}>
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
          Painel do médico chegará na próxima fase: agenda diária, histórico do paciente e publicação de resultados.
        </div>
      </AppShell>
    </ProtectedShell>
  ),
});