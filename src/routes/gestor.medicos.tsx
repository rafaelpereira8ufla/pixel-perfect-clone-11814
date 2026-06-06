import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pencil, Save, X, Plus, Trash2, CalendarPlus, Stethoscope } from "lucide-react";

export const Route = createFileRoute("/gestor/medicos")({
  component: Medicos,
});

type Medico = {
  id: string;
  nome: string;
  email: string | null;
  crm: string;
  especialidade: string;
};
type Horario = {
  id: string;
  medico_id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  disponivel: boolean;
};

function Medicos() {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [edit, setEdit] = useState({ especialidade: "", crm: "" });
  const [openMedico, setOpenMedico] = useState<string | null>(null);
  const [novoHorario, setNovoHorario] = useState({
    data: "",
    hora_inicio: "08:00",
    hora_fim: "08:30",
  });

  const load = async () => {
    setLoading(true);
    const [m, h] = await Promise.all([
      supabase.from("medicos").select("id, nome, email, crm, especialidade").order("nome"),
      supabase
        .from("horarios_disponiveis")
        .select("id, medico_id, data, hora_inicio, hora_fim, disponivel")
        .gte("data", new Date().toISOString().slice(0, 10))
        .order("data"),
    ]);
    setMedicos((m.data as Medico[]) ?? []);
    setHorarios((h.data as Horario[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const startEdit = (med: Medico) => {
    setEditId(med.id);
    setEdit({ especialidade: med.especialidade, crm: med.crm });
  };

  const saveEdit = async (id: string) => {
    if (!edit.especialidade.trim() || !edit.crm.trim()) {
      return toast.error("Especialidade e CRM são obrigatórios.");
    }
    const { error } = await supabase
      .from("medicos")
      .update({ especialidade: edit.especialidade.trim(), crm: edit.crm.trim() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Médico atualizado.");
    setEditId(null);
    await load();
  };

  const addHorario = async (medicoId: string) => {
    if (!novoHorario.data) return toast.error("Selecione a data.");
    if (novoHorario.hora_fim <= novoHorario.hora_inicio) {
      return toast.error("Hora fim deve ser maior que hora início.");
    }
    const { error } = await supabase.from("horarios_disponiveis").insert({
      medico_id: medicoId,
      data: novoHorario.data,
      hora_inicio: novoHorario.hora_inicio,
      hora_fim: novoHorario.hora_fim,
      disponivel: true,
    });
    if (error) return toast.error(error.message);
    toast.success("Horário adicionado.");
    setNovoHorario({ data: "", hora_inicio: "08:00", hora_fim: "08:30" });
    await load();
  };

  const removeHorario = async (id: string) => {
    const { error } = await supabase.from("horarios_disponiveis").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Horário removido.");
    await load();
  };

  if (loading) return <p className="text-sm text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center gap-2">
        <Stethoscope className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Médicos & disponibilidade</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Pacientes só conseguem agendar com médicos cadastrados aqui e somente nos
        horários publicados. Para cadastrar um novo médico, use{" "}
        <strong>Usuários & Funções</strong>.
      </p>

      {medicos.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
          Nenhum médico cadastrado ainda.
        </div>
      ) : (
        medicos.map((med) => {
          const meusHorarios = horarios.filter((h) => h.medico_id === med.id);
          const isOpen = openMedico === med.id;
          const isEditing = editId === med.id;
          return (
            <div key={med.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-semibold">{med.nome}</div>
                  <div className="text-sm text-muted-foreground">{med.email}</div>
                  {isEditing ? (
                    <div className="grid sm:grid-cols-2 gap-3 mt-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Especialidade</Label>
                        <Input
                          value={edit.especialidade}
                          onChange={(e) =>
                            setEdit((s) => ({ ...s, especialidade: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">CRM</Label>
                        <Input
                          value={edit.crm}
                          onChange={(e) => setEdit((s) => ({ ...s, crm: e.target.value }))}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{med.especialidade}</Badge>
                      <Badge variant="outline">CRM {med.crm}</Badge>
                      <Badge variant="outline">
                        {meusHorarios.filter((h) => h.disponivel).length} horários livres
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button size="sm" onClick={() => saveEdit(med.id)}>
                        <Save className="h-4 w-4" /> Salvar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => startEdit(med)}>
                        <Pencil className="h-4 w-4" /> Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setOpenMedico(isOpen ? null : med.id)}
                      >
                        <CalendarPlus className="h-4 w-4" />{" "}
                        {isOpen ? "Fechar horários" : "Horários"}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="mt-5 border-t border-border pt-4 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
                    <div className="space-y-1">
                      <Label className="text-xs">Data</Label>
                      <Input
                        type="date"
                        value={novoHorario.data}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) =>
                          setNovoHorario((s) => ({ ...s, data: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Início</Label>
                      <Input
                        type="time"
                        value={novoHorario.hora_inicio}
                        onChange={(e) =>
                          setNovoHorario((s) => ({ ...s, hora_inicio: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Fim</Label>
                      <Input
                        type="time"
                        value={novoHorario.hora_fim}
                        onChange={(e) =>
                          setNovoHorario((s) => ({ ...s, hora_fim: e.target.value }))
                        }
                      />
                    </div>
                    <Button size="sm" onClick={() => addHorario(med.id)}>
                      <Plus className="h-4 w-4" /> Adicionar
                    </Button>
                  </div>

                  {meusHorarios.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum horário futuro publicado para este médico.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-muted-foreground">
                          <tr className="border-b border-border">
                            <th className="text-left p-2 font-medium">Data</th>
                            <th className="text-left p-2 font-medium">Horário</th>
                            <th className="text-left p-2 font-medium">Status</th>
                            <th className="text-right p-2 font-medium">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {meusHorarios.map((h) => (
                            <tr key={h.id} className="border-b border-border">
                              <td className="p-2">
                                {new Date(h.data + "T00:00").toLocaleDateString("pt-BR")}
                              </td>
                              <td className="p-2">
                                {h.hora_inicio.slice(0, 5)} – {h.hora_fim.slice(0, 5)}
                              </td>
                              <td className="p-2">
                                <Badge
                                  variant="outline"
                                  className={
                                    h.disponivel
                                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                      : "bg-muted text-muted-foreground"
                                  }
                                >
                                  {h.disponivel ? "Disponível" : "Reservado"}
                                </Badge>
                              </td>
                              <td className="p-2 text-right">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => removeHorario(h.id)}
                                  disabled={!h.disponivel}
                                  title={
                                    h.disponivel
                                      ? "Remover horário"
                                      : "Horário já reservado por uma consulta"
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}