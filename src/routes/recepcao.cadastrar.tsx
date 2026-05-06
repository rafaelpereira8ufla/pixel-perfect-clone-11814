import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/recepcao/cadastrar")({
  component: Cadastrar,
});

function Cadastrar() {
  const [form, setForm] = useState({ nome: "", cpf: "", email: "", telefone: "", data_nascimento: "" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Para criar conta com login, peça que o paciente se cadastre pelo portal. Em breve: cadastro direto pela recepção.");
  };
  return (
    <form onSubmit={submit} className="max-w-xl grid gap-4 sm:grid-cols-2">
      <h2 className="text-xl font-semibold sm:col-span-2">Cadastrar Paciente</h2>
      {[
        ["nome", "Nome completo", "text"],
        ["cpf", "CPF", "text"],
        ["email", "E-mail", "email"],
        ["telefone", "Telefone", "text"],
        ["data_nascimento", "Data de nascimento", "date"],
      ].map(([k, lbl, type]) => (
        <div key={k} className="space-y-2">
          <Label htmlFor={k}>{lbl}</Label>
          <Input id={k} type={type} value={(form as any)[k]} onChange={set(k)} required />
        </div>
      ))}
      <Button type="submit" className="sm:col-span-2">Salvar</Button>
    </form>
  );
}