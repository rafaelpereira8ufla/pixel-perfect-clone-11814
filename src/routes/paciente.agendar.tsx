import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/paciente/agendar")({
  component: Agendar,
});

interface Medico {
  id: string;
  nome: string;
  especialidade: string;
}
interface Horario {
  id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
}

// Gera um link Jitsi Meet funcional e gratuito
function gerarLinkTelemedicina(): string {
  const slug = crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
  return `https://meet.jit.si/SaudeTotal-${slug}`;
}

function Agendar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [especialidade, setEspecialidade] = useState("");
  const [medicoId, setMedicoId] = useState("");
  const [modalidade, setModalidade] = useState<"presencial" | "telemedicina">(
    "presencial"
  );
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [horarioId, setHorarioId] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase
      .from("medicos")
      .select("id, nome, especialidade")
      .then(({ data }) => setMedicos(data ?? []));
  }, []);

  useEffect(() => {
    if (!medicoId) return;
    setHorarioId("");
    supabase
      .from("horarios_disponiveis")
      .select("id, data, hora_inicio, hora_fim")
      .eq("medico_id", medicoId)
      .eq("disponivel", true)
      .gte("data", new Date().toISOString().slice(0, 10))
      .order("data")
      .then(({ data }) => setHorarios(data ?? []));
  }, [medicoId]);

  const especialidades = Array.from(
    new Set(medicos.map((m) => m.especialidade))
  ).sort();

  const filtered = especialidade
    ? medicos.filter((m) => m.especialidade === especialidade)
    : medicos;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !medicoId || !horarioId) return;
    setBusy(true);

    const h = horarios.find((x) => x.id === horarioId)!;
    const data_consulta = new Date(
      `${h.data}T${h.hora_inicio}`
    ).toISOString();

    // Para telemedicina: gera link Jitsi real e status 'link_enviado'
    // Para presencial: status 'agendado', sem link
    const link = modalidade === "telemedicina" ? gerarLinkTelemedicina() : null;
    const status = modalidade === "telemedicina" ? "link_enviado" : "agendado";

    const { error } = await supabase.from("consultas").insert({
      paciente_id: user.id,
      medico_id: medicoId,
      horario_id: horarioId,
      modalidade,
      status,
      link_telemedicina: link,
      data_consulta,
    });

    if (!error) {
      // Marca horário como indisponível
      await supabase
        .from("horarios_disponiveis")
        .update({ disponivel: false })
        .eq("id", horarioId);
    }

    setBusy(false);

    if (error) return toast.error(error.message);

    if (link) {
      toast.success(
        `Consulta agendada! Link de telemedicina: ${link}`,
        { duration: 8000 }
      );
    } else {
      toast.success("Consulta agendada com sucesso!");
    }

    navigate({ to: "/paciente" });
  };

  return (
    <form onSubmit={submit} className="max-w-xl space-y-5">
      <h2 className="text-xl font-semibold">Agendar Consulta</h2>

      {/* Especialidade */}
      <div className="space-y-2">
        <Label>Especialidade</Label>
        <Select
          value={especialidade}
          onValueChange={(v) => {
            setEspecialidade(v === "__all__" ? "" : v);
            setMedicoId("");
            setHorarioId("");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma especialidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas</SelectItem>
            {especialidades.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Médico */}
      <div className="space-y-2">
        <Label>Médico</Label>
        <Select
          value={medicoId}
          onValueChange={(v) => {
            setMedicoId(v);
            setHorarioId("");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um médico" />
          </SelectTrigger>
          <SelectContent>
            {filtered.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.nome} — {m.especialidade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Modalidade */}
      <div className="space-y-2">
        <Label>Modalidade</Label>
        <Select
          value={modalidade}
          onValueChange={(v) =>
            setModalidade(v as "presencial" | "telemedicina")
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="presencial">Presencial</SelectItem>
            <SelectItem value="telemedicina">Telemedicina</SelectItem>
          </SelectContent>
        </Select>
        {modalidade === "telemedicina" && (
          <p className="text-xs text-muted-foreground">
            Um link de videochamada (Jitsi Meet) será gerado automaticamente e
            exibido nas suas consultas.
          </p>
        )}
      </div>

      {/* Horário */}
      <div className="space-y-2">
        <Label>Horário disponível</Label>
        {medicoId && horarios.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum horário disponível para este médico.
          </p>
        ) : (
          <Select
            value={horarioId}
            onValueChange={setHorarioId}
            disabled={!medicoId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione data e hora" />
            </SelectTrigger>
            <SelectContent>
              {horarios.map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {new Date(h.data).toLocaleDateString("pt-BR")} •{" "}
                  {h.hora_inicio.slice(0, 5)}–{h.hora_fim.slice(0, 5)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Button type="submit" disabled={!horarioId || busy} className="w-full">
        {busy ? "Confirmando..." : "Confirmar agendamento"}
      </Button>
    </form>
  );
}
