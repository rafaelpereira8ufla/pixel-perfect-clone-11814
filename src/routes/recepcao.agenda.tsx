import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/recepcao/agenda")({
  component: Agenda,
});

interface Row {
  id: string;
  data_consulta: string;
  status: string;
  modalidade: string;
  profiles: { nome: string } | null;
  medicos: { nome: string } | null;
}

function Agenda() {
  const [rows, setRows] = useState<Row[]>([]);
  const load = () =>
    supabase
      .from("consultas")
      .select("id, data_consulta, status, modalidade, profiles!consultas_paciente_id_fkey(nome), medicos(nome)")
      .order("data_consulta", { ascending: false })
      .then(({ data }) => setRows((data as unknown as Row[]) ?? []));
  useEffect(() => { load(); }, []);

  const cancel = async (id: string) => {
    const { error } = await supabase.from("consultas").update({ status: "cancelado" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Agendamento cancelado.");
    load();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Todos os agendamentos</h2>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left p-3 font-medium">Data/Hora</th>
              <th className="text-left p-3 font-medium">Paciente</th>
              <th className="text-left p-3 font-medium">Médico</th>
              <th className="text-left p-3 font-medium">Modalidade</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-right p-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3">{new Date(r.data_consulta).toLocaleString("pt-BR")}</td>
                <td className="p-3">{r.profiles?.nome}</td>
                <td className="p-3">{r.medicos?.nome}</td>
                <td className="p-3 capitalize">{r.modalidade}</td>
                <td className="p-3"><StatusBadge status={r.status} /></td>
                <td className="p-3 text-right">
                  {r.status !== "cancelado" && r.status !== "realizado" && (
                    <Button size="sm" variant="outline" onClick={() => cancel(r.id)}>Cancelar</Button>
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