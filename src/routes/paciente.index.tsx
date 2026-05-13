import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { StatusBadge } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/paciente/")({
  component: MinhasConsultas,
});

interface Consulta {
  id: string;
  modalidade: string;
  status: string;
  data_consulta: string;
  link_telemedicina: string | null;
  medicos: { nome: string; especialidade: string } | null;
}

function MinhasConsultas() {
  const { user } = useAuth();
  const [list, setList] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("consultas")
      .select("id, modalidade, status, data_consulta, link_telemedicina, medicos(nome, especialidade)")
      .eq("paciente_id", user.id)
      .order("data_consulta", { ascending: false });
    if (error) toast.error(error.message);
    setList((data as unknown as Consulta[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const cancel = async (c: Consulta) => {
    const diff = (new Date(c.data_consulta).getTime() - Date.now()) / 36e5;
    if (diff < 2) return toast.error("Cancelamento permitido apenas com mais de 2h de antecedência.");
    const { error } = await supabase.from("consultas").update({ status: "cancelado" }).eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Consulta cancelada.");
    load();
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-xl font-semibold">Minhas Consultas</h2>
        <Button asChild>
          <Link to="/paciente/agendar">
            <CalendarPlus className="h-4 w-4" /> Agendar nova consulta
          </Link>
        </Button>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
          Você ainda não tem consultas agendadas.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 min-h-[160px]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{c.medicos?.nome ?? "Médico"}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {c.medicos?.especialidade}
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="text-sm text-muted-foreground">
                <div className="capitalize">{c.modalidade}</div>
                <div>{new Date(c.data_consulta).toLocaleString("pt-BR")}</div>
              </div>
              <div className="mt-auto flex justify-end">
                {c.status !== "cancelado" && c.status !== "realizado" && (
                  <Button variant="outline" size="sm" onClick={() => cancel(c)}>
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}