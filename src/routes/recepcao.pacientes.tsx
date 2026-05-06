import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/recepcao/pacientes")({
  component: Pacientes,
});

interface P { id: string; nome: string; cpf: string | null; email: string | null; telefone: string | null }

function Pacientes() {
  const [list, setList] = useState<P[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => {
    supabase.from("profiles").select("id, nome, cpf, email, telefone").order("nome").then(({ data }) => setList((data ?? []) as P[]));
  }, []);
  const filtered = list.filter((p) =>
    [p.nome, p.cpf, p.email].some((s) => s?.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-semibold mb-4">Pacientes</h2>
      <Input placeholder="Buscar por nome, CPF ou e-mail..." value={q} onChange={(e) => setQ(e.target.value)} className="mb-4 max-w-md" />
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left p-3 font-medium">Nome</th>
              <th className="text-left p-3 font-medium">CPF</th>
              <th className="text-left p-3 font-medium">E-mail</th>
              <th className="text-left p-3 font-medium">Telefone</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">{p.nome}</td>
                <td className="p-3">{p.cpf ?? "—"}</td>
                <td className="p-3">{p.email ?? "—"}</td>
                <td className="p-3">{p.telefone ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}