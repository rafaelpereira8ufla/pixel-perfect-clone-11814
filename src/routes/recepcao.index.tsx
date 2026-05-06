import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/recepcao/")({
  component: Dashboard,
});

interface Row {
  id: string;
  data_consulta: string;
  status: string;
  modalidade: string;
  profiles: { nome: string } | null;
  medicos: { nome: string; especialidade: string } | null;
}

function Dashboard() {
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    const { data, error } = await supabase
      .from("consultas")
      .select("id, data_consulta, status, modalidade, profiles!consultas_paciente_id_fkey(nome), medicos(nome, especialidade)")
      .gte("data_consulta", start.toISOString())
      .lte("data_consulta", end.toISOString())
      .order("data_consulta");
    if (error) toast.error(error.message);
    setRows((data as unknown as Row[]) ?? []);
  };

  useEffect(() => { load(); }, []);

  const registrarChegada = async (id: string) => {
    const { error } = await supabase.from("consultas").update({ status: "confirmado" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Chegada registrada.");
    load();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Consultas de hoje</h2>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left p-3 font-medium">Horário</th>
              <th className="text-left p-3 font-medium">Paciente</th>
              <th className="text-left p-3 font-medium">Médico</th>
              <th className="text-left p-3 font-medium">Modalidade</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-right p-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Nenhuma consulta para hoje.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3">{new Date(r.data_consulta).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td>
                <td className="p-3">{r.profiles?.nome ?? "—"}</td>
                <td className="p-3">{r.medicos?.nome} <span className="text-muted-foreground">• {r.medicos?.especialidade}</span></td>
                <td className="p-3 capitalize">{r.modalidade}</td>
                <td className="p-3"><StatusBadge status={r.status} /></td>
                <td className="p-3 text-right">
                  {r.status === "agendado" && (
                    <Button size="sm" variant="outline" onClick={() => registrarChegada(r.id)}>
                      Registrar chegada
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}