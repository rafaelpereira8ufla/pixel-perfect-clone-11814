import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CalendarDays, Users, CreditCard, UserPlus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProtectedShell } from "@/components/ProtectedShell";

export const Route = createFileRoute("/recepcao")({
  component: RecepcaoLayout,
});

function RecepcaoLayout() {
  return (
    <ProtectedShell allowed={["recepcionista", "gestor"]}>
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
    </ProtectedShell>
  );
}