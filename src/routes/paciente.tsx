import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CalendarPlus, CalendarDays, FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProtectedShell } from "@/components/ProtectedShell";

export const Route = createFileRoute("/paciente")({
  component: PacienteLayout,
});

function PacienteLayout() {
  return (
    <ProtectedShell allowed={["paciente", "recepcionista", "medico", "gestor"]}>
      <AppShell
        title="Portal do Paciente"
        items={[
          { to: "/paciente", label: "Minhas Consultas", icon: CalendarDays },
          { to: "/paciente/agendar", label: "Agendar Consulta", icon: CalendarPlus },
          { to: "/paciente/resultados", label: "Resultados", icon: FileText },
        ]}
      >
        <Outlet />
      </AppShell>
    </ProtectedShell>
  );
}