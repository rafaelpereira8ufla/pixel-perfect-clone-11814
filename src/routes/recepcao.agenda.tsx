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

export const Route = createFileRoute("/recepcao/agenda")({
  component: Agenda,
});

interface Row {
  id: string;
  data_consulta: string;
  status: string;
  modalidade: string;
  motivo_cancelamento: string | null;
  profiles: { nome: string } | null;
  medicos: { nome: string } | null;
}

function Agenda() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [cancelTarget, setCancelTarget] = useState<Row | null>(null);
  const [motivo, setMotivo] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    supabase
      .from("consultas")
      .select(
        "id, data_consulta, status, modalidade, motivo_cancelamento, profiles!consultas_paciente_id_fkey(nome), medicos(nome)"
      )
      .order("data_consulta", { ascending: false })
      .then(({ data }) => setRows((data as unknown as Row[]) ?? []));

  useEffect(() => {
    load();
  }, []);

  const openCancel = (row: Row) => {
    setMotivo("");
    setCancelTarget(row);
  };

  const confirmCancel = async () => {
    if (!cancelTarget || !user) return;
    if (motivo.trim().length < 3)
      return toast.error("Descreva o motivo do cancelamento.");
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
    toast.success("Agendamento cancelado.");
    setCancelTarget(null);
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
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  Nenhum agendamento encontrado.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3">
                  {new Date(r.data_consulta).toLocaleString("pt-BR")}
                </td>
                <td className="p-3">{r.profiles?.nome ?? "—"}</td>
                <td className="p-3">{r.medicos?.nome ?? "—"}</td>
                <td className="p-3 capitalize">{r.modalidade}</td>
                <td className="p-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="p-3 text-right">
                  {r.status !== "cancelado" && r.status !== "realizado" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openCancel(r)}
                    >
                      <Trash2 className="h-4 w-4" /> Cancelar
                    </Button>
                  )}
                  {r.status === "cancelado" && r.motivo_cancelamento && (
                    <span className="text-xs text-muted-foreground italic">
                      {r.motivo_cancelamento}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog de cancelamento auditado */}
      <Dialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar agendamento</DialogTitle>
            <DialogDescription>
              Informe o motivo do cancelamento. O paciente e o médico terão
              acesso a essa informação.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ex.: solicitação do paciente, reagendamento necessário, etc."
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelTarget(null)}
              disabled={busy}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancel}
              disabled={busy}
            >
              <Trash2 className="h-4 w-4" />
              {busy ? "Cancelando..." : "Confirmar cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
