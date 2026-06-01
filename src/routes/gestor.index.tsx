import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/gestor/")({
  component: () => (
    <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
      KPIs, gráficos e exportação de relatórios chegarão na próxima fase.
      <br />
      Use <strong>Usuários &amp; Funções</strong> para cadastrar médicos, recepcionistas e gestores.
    </div>
  ),
});