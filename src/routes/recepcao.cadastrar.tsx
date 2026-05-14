import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/recepcao/cadastrar")({
  component: Cadastrar,
});

const EMPTY = {
  nome: "",
  cpf: "",
  email: "",
  telefone: "",
  data_nascimento: "",
};

function Cadastrar() {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  const set =
    (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nome.trim()) return toast.error("Nome é obrigatório.");

    setBusy(true);

    // Verifica se já existe um profile com esse e-mail ou CPF
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .or(`email.eq.${form.email},cpf.eq.${form.cpf}`)
      .maybeSingle();

    if (existing) {
      setBusy(false);
      return toast.error("Já existe um paciente cadastrado com esse e-mail ou CPF.");
    }

    // Cria um novo UUID para o perfil (sem conta de login — acesso pelo portal)
    const newId = crypto.randomUUID();

    const { error } = await supabase.from("profiles").insert({
      id: newId,
      nome: form.nome.trim(),
      cpf: form.cpf.trim() || null,
      email: form.email.trim() || null,
      telefone: form.telefone.trim() || null,
      data_nascimento: form.data_nascimento || null,
    });

    setBusy(false);

    if (error) return toast.error(error.message);

    toast.success(`Paciente "${form.nome}" cadastrado com sucesso!`);
    setForm(EMPTY);
  };

  const fields: Array<{
    key: keyof typeof EMPTY;
    label: string;
    type?: string;
    required?: boolean;
  }> = [
    { key: "nome", label: "Nome completo", required: true },
    { key: "cpf", label: "CPF" },
    { key: "email", label: "E-mail", type: "email" },
    { key: "telefone", label: "Telefone" },
    { key: "data_nascimento", label: "Data de nascimento", type: "date" },
  ];

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-semibold mb-6">Cadastrar Paciente</h2>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        {fields.map(({ key, label, type = "text", required }) => (
          <div
            key={key}
            className={`space-y-2 ${key === "nome" ? "sm:col-span-2" : ""}`}
          >
            <Label htmlFor={key}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={key}
              type={type}
              value={form[key]}
              onChange={set(key)}
              required={required}
              placeholder={label}
            />
          </div>
        ))}

        <div className="sm:col-span-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <strong>Atenção:</strong> este cadastro cria o perfil do paciente no
          sistema. Para que o paciente possa fazer login e agendar consultas pelo
          portal, peça que ele se cadastre em{" "}
          <span className="font-mono">/cadastro</span> usando o mesmo e-mail.
        </div>

        <Button type="submit" className="sm:col-span-2 w-full" disabled={busy}>
          {busy ? "Salvando..." : "Salvar paciente"}
        </Button>
      </form>
    </div>
  );
}
