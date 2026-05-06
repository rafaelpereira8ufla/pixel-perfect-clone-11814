import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CalendarPlus, CalendarDays, FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { requireAuth } from "@/lib/guards";

export const Route = createFileRoute("/paciente")({
  beforeLoad: async ({ location }) => {
    await requireAuth(location.href, ["paciente", "recepcionista", "medico", "gestor"]);
  },
  component: PacienteLayout,
});

function PacienteLayout() {
  return (
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
  );
}