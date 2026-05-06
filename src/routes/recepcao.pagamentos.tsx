import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/recepcao/pagamentos")({
  component: Pagamentos,
});

interface Consulta { id: string; data_consulta: string; profiles: { nome: string } | null }

function Pagamentos() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [consultaId, setConsultaId] = useState("");
  const [valor, setValor] = useState("");
  const [forma, setForma] = useState<"dinheiro" | "cartao" | "convenio">("cartao");

  useEffect(() => {
    supabase
      .from("consultas")
      .select("id, data_consulta, profiles!consultas_paciente_id_fkey(nome)")
      .in("status", ["realizado", "confirmado"])
      .order("data_consulta", { ascending: false })
      .then(({ data }) => setConsultas((data as unknown as Consulta[]) ?? []));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("pagamentos").insert({
      consulta_id: consultaId,
      valor: Number(valor),
      forma_pagamento: forma,
      nota_fiscal_gerada: true,
    });
    if (error) return toast.error(error.message);
    toast.success("Pagamento registrado e nota fiscal gerada.");
    setConsultaId(""); setValor("");
  };

  return (
    <form onSubmit={submit} className="max-w-xl space-y-4">
      <h2 className="text-xl font-semibold">Gerar Pagamento</h2>
      <div className="space-y-2">
        <Label>Consulta</Label>
        <Select value={consultaId} onValueChange={setConsultaId}>
          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>
            {consultas.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.profiles?.nome} — {new Date(c.data_consulta).toLocaleString("pt-BR")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Valor (R$)</Label>
        <Input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Forma de pagamento</Label>
        <Select value={forma} onValueChange={(v) => setForma(v as typeof forma)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="dinheiro">Dinheiro</SelectItem>
            <SelectItem value="cartao">Cartão</SelectItem>
            <SelectItem value="convenio">Convênio</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={!consultaId || !valor}>Gerar nota fiscal</Button>
    </form>
  );
}