import { createFileRoute } from "@tanstack/react-router";
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
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/medico/")({
  component: AgendaMedico,
});

interface Consulta {
  id: string;
  modalidade: string;
  status: string;
  data_consulta: string;
  motivo_cancelamento: string | null;
  medico_id: string;
  paciente_id: string;
  profiles: { nome: string; email: string | null } | null;
}

function AgendaMedico() {
  const { user } = useAuth();
  const [list, setList] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [medicoId, setMedicoId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Consulta | null>(null);
  const [motivo, setMotivo] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data: m } = await supabase.from("medicos").select("id").eq("user_id", user.id).maybeSingle();
    const mid = m?.id ?? null;
    setMedicoId(mid);

    let query = supabase
      .from("consultas")
      .select(
        "id, modalidade, status, data_consulta, motivo_cancelamento, medico_id, paciente_id, profiles!consultas_paciente_id_fkey(nome, email)"
      )
      .order("data_consulta", { ascending: true });

    if (mid) query = query.eq("medico_id", mid);

    const { data, error } = await query;
    if (error) {
      // fallback sem join se a FK não existir
      const fb = await supabase
        .from("consultas")
        .select("id, modalidade, status, data_consulta, motivo_cancelamento, medico_id, paciente_id")
        .order("data_consulta", { ascending: true });
      const rows = (fb.data ?? []) as Consulta[];
      const ids = Array.from(new Set(rows.map((r) => r.paciente_id)));
      const { data: profs } = await supabase.from("profiles").select("id, nome, email").in("id", ids);
      const map = new Map((profs ?? []).map((p) => [p.id, { nome: p.nome, email: p.email }]));
      setList(
        rows
          .filter((r) => !mid || r.medico_id === mid)
          .map((r) => ({ ...r, profiles: map.get(r.paciente_id) ?? null }))
      );
    } else {
      setList((data as unknown as Consulta[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const openCancel = (c: Consulta) => {
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
    <div className="max-w-5xl">
      <h2 className="text-xl font-semibold mb-4">Minha Agenda</h2>
      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : !medicoId ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
          Seu usuário ainda não está vinculado a um cadastro de médico. Peça ao gestor para fazer a vinculação.
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
          Você ainda não tem consultas na agenda.
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
                  <div className="font-medium truncate">{c.profiles?.nome ?? "Paciente"}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {c.profiles?.email ?? ""}
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
              <div className="mt-auto flex justify-end">
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
              Informe o motivo do cancelamento. O paciente também verá essa mensagem.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ex.: imprevisto, reagendamento necessário, etc."
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
