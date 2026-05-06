import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Activity } from "lucide-react";

export const Route = createFileRoute("/cadastro")({
  head: () => ({ meta: [{ title: "Cadastro — Saúde Total" }] }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    data_nascimento: "",
    password: "",
  });
  const [busy, setBusy] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/paciente`,
        data: {
          nome: form.nome,
          cpf: form.cpf,
          telefone: form.telefone,
          data_nascimento: form.data_nascimento,
        },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Conta criada! Verifique seu e-mail para confirmar.");
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="w-full max-w-lg">
        <Link to="/" className="flex items-center gap-2 font-semibold justify-center mb-8">
          <span className="grid place-items-center h-8 w-8 rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-4 w-4" />
          </span>
          Saúde Total
        </Link>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-semibold">Criar conta</h1>
          <p className="text-sm text-muted-foreground mt-1">Cadastro de paciente</p>
          <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Nome completo" id="nome" required value={form.nome} onChange={set("nome")} className="sm:col-span-2" />
            <Field label="CPF" id="cpf" required value={form.cpf} onChange={set("cpf")} />
            <Field label="Telefone" id="telefone" required value={form.telefone} onChange={set("telefone")} />
            <Field label="Data de nascimento" id="dn" type="date" required value={form.data_nascimento} onChange={set("data_nascimento")} />
            <Field label="E-mail" id="email" type="email" required value={form.email} onChange={set("email")} />
            <Field label="Senha" id="password" type="password" required value={form.password} onChange={set("password")} className="sm:col-span-2" />
            <Button type="submit" className="sm:col-span-2 w-full" disabled={busy}>
              {busy ? "Criando..." : "Criar conta"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-6 text-center">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
    </div>
  );
}