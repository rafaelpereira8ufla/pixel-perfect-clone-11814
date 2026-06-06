import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarCheck2, XCircle, DollarSign, TrendingDown, Activity } from "lucide-react";

export const Route = createFileRoute("/gestor/")({
  component: Dashboard,
});

type Consulta = { id: string; status: string; data_consulta: string };
type Pagamento = { valor: number; consulta_id: string };

const BRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Card({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: any;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "good" | "bad";
}) {
  const toneCls =
    tone === "good"
      ? "text-emerald-600"
      : tone === "bad"
      ? "text-destructive"
      : "text-primary";
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Icon className={`h-4 w-4 ${toneCls}`} />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function Dashboard() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [c, p] = await Promise.all([
        supabase.from("consultas").select("id, status, data_consulta"),
        supabase.from("pagamentos").select("valor, consulta_id"),
      ]);
      setConsultas((c.data as Consulta[]) ?? []);
      setPagamentos((p.data as Pagamento[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const total = consultas.length;
  const canceladas = consultas.filter((c) => c.status === "cancelado").length;
  const realizadas = consultas.filter((c) => c.status === "realizado").length;
  const marcadas = consultas.filter(
    (c) => !["cancelado", "realizado"].includes(c.status),
  ).length;
  const recebido = pagamentos.reduce((s, p) => s + Number(p.valor), 0);
  const pagasCount = new Set(pagamentos.map((p) => p.consulta_id)).size;
  const ticketMedio = pagasCount > 0 ? recebido / pagasCount : 0;
  const perdidoEstimado = canceladas * ticketMedio;

  if (loading) {
    return <p className="text-sm text-muted-foreground">Carregando indicadores...</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Visão geral da clínica</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          icon={CalendarCheck2}
          label="Consultas marcadas (ativas)"
          value={String(marcadas)}
          hint={`${total} consultas no histórico total`}
        />
        <Card
          icon={Activity}
          label="Consultas realizadas"
          value={String(realizadas)}
          tone="good"
        />
        <Card
          icon={XCircle}
          label="Consultas canceladas"
          value={String(canceladas)}
          tone="bad"
        />
        <Card
          icon={DollarSign}
          label="Valor recebido"
          value={BRL(recebido)}
          hint={`Ticket médio ${BRL(ticketMedio)}`}
          tone="good"
        />
        <Card
          icon={TrendingDown}
          label="Valor perdido (estimado por cancelamentos)"
          value={BRL(perdidoEstimado)}
          hint={`${canceladas} × ticket médio`}
          tone="bad"
        />
        <Card
          icon={DollarSign}
          label="Receita líquida estimada"
          value={BRL(recebido - perdidoEstimado)}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Indicadores calculados em tempo real a partir das consultas e pagamentos
        registrados. O valor perdido é uma estimativa baseada no ticket médio
        das consultas efetivamente pagas.
      </p>
    </div>
  );
}