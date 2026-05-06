import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CalendarDays, Users, CreditCard, UserPlus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { requireAuth } from "@/lib/guards";

export const Route = createFileRoute("/recepcao")({
  beforeLoad: async () => {
    await requireAuth(["recepcionista", "gestor"]);
  },
  component: RecepcaoLayout,
});

function RecepcaoLayout() {
  return (
    <AppShell
      title="Painel da Recepção"
      items={[
        { to: "/recepcao", label: "Dashboard", icon: CalendarDays },
        { to: "/recepcao/agenda", label: "Gerenciar Agenda", icon: CalendarDays },
        { to: "/recepcao/pacientes", label: "Pacientes", icon: Users },
        { to: "/recepcao/cadastrar", label: "Cadastrar Paciente", icon: UserPlus },
        { to: "/recepcao/pagamentos", label: "Pagamentos", icon: CreditCard },
      ]}
    >
      <Outlet />
    </AppShell>
  );
}