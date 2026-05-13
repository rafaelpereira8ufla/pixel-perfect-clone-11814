import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProtectedShell } from "@/components/ProtectedShell";
import { AppShell } from "@/components/AppShell";
import { CalendarDays } from "lucide-react";

export const Route = createFileRoute("/medico")({
  component: MedicoLayout,
});

function MedicoLayout() {
  return (
    <ProtectedShell allowed={["medico", "gestor"]}>
      <AppShell
        title="Painel do Médico"
        items={[{ to: "/medico", label: "Minha Agenda", icon: CalendarDays }]}
      >
        <Outlet />
      </AppShell>
    </ProtectedShell>
  );
}