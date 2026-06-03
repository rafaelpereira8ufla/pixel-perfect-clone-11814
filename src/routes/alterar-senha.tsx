import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { primaryRoute, type AppRole } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

export const Route = createFileRoute("/alterar-senha")({
  head: () => ({ meta: [{ title: "Alterar senha — Saúde Total" }] }),
  component: AlterarSenha,
});

function AlterarSenha() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (!session?.user) {
        window.location.assign("/login?redirect=/alterar-senha");
        return;
      }
      setUserId(session.user.id);
      setChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha.length < 8) return toast.error("A senha precisa ter ao menos 8 caracteres.");
    if (senha !== confirmar) return toast.error("As senhas não coincidem.");
    if (!userId) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      const { error: pErr } = await supabase
        .from("profiles")
        .update({ must_change_password: false })
        .eq("id", userId);
      if (pErr) throw pErr;
      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      const roles = (roleRows ?? []).map((r) => r.role as AppRole);
      toast.success("Senha atualizada com sucesso!");
      navigate({ to: primaryRoute(roles) });
    } catch (err: any) {
      toast.error(err?.message ?? "Falha ao atualizar a senha.");
    } finally {
      setBusy(false);
    }
  };

  if (checking) {
    return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="grid place-items-center h-8 w-8 rounded-lg bg-primary text-primary-foreground">
            <KeyRound className="h-4 w-4" />
          </span>
          <h1 className="text-2xl font-semibold">Defina sua nova senha</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Este é o seu primeiro acesso. Por segurança, escolha uma nova senha para continuar.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="senha">Nova senha</Label>
            <Input id="senha" type="password" minLength={8} required value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmar">Confirmar nova senha</Label>
            <Input id="confirmar" type="password" minLength={8} required value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      </div>
    </div>
  );
}