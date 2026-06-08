import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { StatusBadge } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarPlus, Trash2, Copy, Link2 } from "lucide-react";
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
  motivo_cancelamento: string | null;
  medicos: { nome: string; especialidade: string } | null;
}

function MinhasConsultas() {
  const { user } = useAuth();
  const [list, setList] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<Consulta | null>(null);
  const [motivo, setMotivo] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("consultas")
      .select("id, modalidade, status, data_consulta, link_telemedicina, motivo_cancelamento, medicos(nome, especialidade)")
      .eq("paciente_id", user.id)
      .order("data_consulta", { ascending: false });
    if (error) toast.error(error.message);
    setList((data as unknown as Consulta[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const openCancel = (c: Consulta) => {
    const diff = (new Date(c.data_consulta).getTime() - Date.now()) / 36e5;
    if (diff < 2) return toast.error("Cancelamento permitido apenas com mais de 2h de antecedência.");
    setMotivo("");
    setCancelTarget(c);
  };

  const confirmCancel = async () => {
    if (!cancelTarget || !user) return;
    if (motivo.trim().length < 3) return toast.error("Descreva o motivo do cancelamento.");
    setBusy(true);
    const { error } = await supabase
      .from("consultas")
      .update({
        status: "cancelado",
        motivo_cancelamento: motivo.trim(),
        cancelado_por: user.id,
        cancelado_em: new Date().toISOString(),
      })
      .eq("id", cancelTarget.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Consulta cancelada.");
    setCancelTarget(null);
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
              {c.status === "cancelado" && c.motivo_cancelamento && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <span className="font-medium">Motivo do cancelamento:</span> {c.motivo_cancelamento}
                </div>
              )}
              <div className="mt-auto flex justify-end gap-2 flex-wrap">
                {c.modalidade === "telemedicina" && c.link_telemedicina && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(c.link_telemedicina!);
                      toast.success("Link de telemedicina copiado!");
                    }}
                  >
                    <Copy className="h-4 w-4" /> Copiar link
                  </Button>
                )}
                {c.status !== "cancelado" && c.status !== "realizado" && (
                  <Button variant="destructive" size="sm" onClick={() => openCancel(c)}>
                    <Trash2 className="h-4 w-4" /> Cancelar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar consulta</DialogTitle>
            <DialogDescription>
              Conte rapidamente o motivo do cancelamento. Essa informação será compartilhada com o médico.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ex.: imprevisto pessoal, melhora dos sintomas, etc."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)} disabled={busy}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={confirmCancel} disabled={busy}>
              <Trash2 className="h-4 w-4" /> {busy ? "Cancelando..." : "Confirmar cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}