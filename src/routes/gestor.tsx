import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProtectedShell } from "@/components/ProtectedShell";
import { AppShell } from "@/components/AppShell";
import { BarChart3, Users } from "lucide-react";

export const Route = createFileRoute("/gestor")({
  component: GestorLayout,
});

function GestorLayout() {
  return (
    <ProtectedShell allowed={["gestor"]}>
      <AppShell
        title="Painel do Gestor"
        items={[
          { to: "/gestor", label: "Dashboard", icon: BarChart3 },
          { to: "/gestor/usuarios", label: "Usuários & Funções", icon: Users },
        ]}
      >
        <Outlet />
      </AppShell>
    </ProtectedShell>
  );
}