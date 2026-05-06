import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/paciente/resultados")({
  component: Resultados,
});

interface Resultado {
  id: string;
  descricao: string;
  publicado_em: string;
  consultas: { data_consulta: string; medicos: { nome: string; especialidade: string } | null } | null;
}

function Resultados() {
  const [list, setList] = useState<Resultado[]>([]);

  useEffect(() => {
    supabase
      .from("resultados_consulta")
      .select("id, descricao, publicado_em, consultas(data_consulta, medicos(nome, especialidade))")
      .order("publicado_em", { ascending: false })
      .then(({ data }) => setList((data as unknown as Resultado[]) ?? []));
  }, []);

  return (
    <div className="max-w-3xl space-y-4">
      <h2 className="text-xl font-semibold">Resultados</h2>
      {list.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
          Nenhum resultado publicado ainda.
        </div>
      ) : (
        list.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{r.consultas?.medicos?.nome} — {r.consultas?.medicos?.especialidade}</span>
              <span>{new Date(r.publicado_em).toLocaleDateString("pt-BR")}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm">{r.descricao}</p>
          </div>
        ))
      )}
    </div>
  );
}