import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, ShieldCheck } from "lucide-react";
import {
  createStaffUser,
  listStaffUsers,
  setUserRoles,
  deleteStaffUser,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/gestor/usuarios")({
  component: Usuarios,
});

type AppRole = "paciente" | "recepcionista" | "medico" | "gestor";
type StaffUser = { id: string; nome: string; email: string | null; roles: string[] };

const ROLE_LABEL: Record<AppRole, string> = {
  gestor: "Gestor",
  medico: "Médico",
  recepcionista: "Recepcionista",
  paciente: "Paciente",
};

const ROLE_COLOR: Record<AppRole, string> = {
  gestor: "bg-purple-100 text-purple-800 border-purple-200",
  medico: "bg-blue-100 text-blue-800 border-blue-200",
  recepcionista: "bg-amber-100 text-amber-800 border-amber-200",
  paciente: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const EMPTY = {
  nome: "",
  email: "",
  password: "",
  role: "medico" as AppRole,
  cpf: "",
  telefone: "",
  especialidade: "",
  crm: "",
};

function Usuarios() {
  const fnCreate = useServerFn(createStaffUser);
  const fnList = useServerFn(listStaffUsers);
  const fnSetRoles = useServerFn(setUserRoles);
  const fnDelete = useServerFn(deleteStaffUser);

  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fnList();
      setUsers(res.users as StaffUser[]);
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await fnCreate({
        data: {
          email: form.email.trim(),
          password: form.password,
          nome: form.nome.trim(),
          role: form.role,
          cpf: form.cpf.trim() || null,
          telefone: form.telefone.trim() || null,
          especialidade: form.role === "medico" ? form.especialidade.trim() : null,
          crm: form.role === "medico" ? form.crm.trim() : null,
        },
      });
      toast.success(`Usuário "${form.nome}" criado como ${ROLE_LABEL[form.role]}.`);
      setForm(EMPTY);
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao criar usuário.");
    } finally {
      setBusy(false);
    }
  };

  const toggleRole = async (user: StaffUser, role: AppRole) => {
    const has = user.roles.includes(role);
    const next = has ? user.roles.filter((r) => r !== role) : [...user.roles, role];
    if (next.length === 0) return toast.error("O usuário precisa ter ao menos uma função.");
    try {
      await fnSetRoles({ data: { userId: user.id, roles: next as AppRole[] } });
      toast.success("Funções atualizadas.");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao atualizar funções.");
    }
  };

  const remove = async (user: StaffUser) => {
    if (!confirm(`Excluir definitivamente o usuário "${user.nome}"?`)) return;
    try {
      await fnDelete({ data: { userId: user.id } });
      toast.success("Usuário excluído.");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao excluir usuário.");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Cadastrar novo usuário</h2>
        </div>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Função no sistema *</Label>
            <Select
              value={form.role}
              onValueChange={(v) => setForm((f) => ({ ...f, role: v as AppRole }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="medico">Médico</SelectItem>
                <SelectItem value="recepcionista">Recepcionista</SelectItem>
                <SelectItem value="gestor">Gestor</SelectItem>
                <SelectItem value="paciente">Paciente</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Define o nível de acesso: <strong>Gestor</strong> administra tudo,{" "}
              <strong>Médico</strong> vê sua agenda e publica resultados,{" "}
              <strong>Recepcionista</strong> agenda consultas e cadastra pacientes,{" "}
              <strong>Paciente</strong> agenda e cancela suas próprias consultas.
            </p>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="nome">Nome completo *</Label>
            <Input id="nome" required value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input id="email" type="email" required value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha inicial (mín. 8) *</Label>
            <Input id="password" type="text" minLength={8} required value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" value={form.cpf}
              onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" value={form.telefone}
              onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))} />
          </div>

          {form.role === "medico" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="especialidade">Especialidade *</Label>
                <Input id="especialidade" required value={form.especialidade}
                  onChange={(e) => setForm((f) => ({ ...f, especialidade: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crm">CRM *</Label>
                <Input id="crm" required value={form.crm}
                  onChange={(e) => setForm((f) => ({ ...f, crm: e.target.value }))} />
              </div>
            </>
          )}

          <Button type="submit" disabled={busy} className="sm:col-span-2">
            {busy ? "Criando..." : `Criar usuário ${ROLE_LABEL[form.role]}`}
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Usuários & funções</h2>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="text-left p-2 font-medium">Nome</th>
                  <th className="text-left p-2 font-medium">E-mail</th>
                  <th className="text-left p-2 font-medium">Funções atribuídas</th>
                  <th className="text-right p-2 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border align-top">
                    <td className="p-2 font-medium">{u.nome}</td>
                    <td className="p-2 text-muted-foreground">{u.email ?? "—"}</td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1.5">
                        {(["gestor", "medico", "recepcionista", "paciente"] as AppRole[]).map((r) => {
                          const active = u.roles.includes(r);
                          return (
                            <button
                              key={r}
                              type="button"
                              onClick={() => toggleRole(u, r)}
                              className="focus:outline-none"
                              title={active ? `Remover função ${ROLE_LABEL[r]}` : `Atribuir função ${ROLE_LABEL[r]}`}
                            >
                              <Badge
                                variant="outline"
                                className={
                                  active
                                    ? `${ROLE_COLOR[r]} cursor-pointer`
                                    : "bg-muted text-muted-foreground border-border cursor-pointer opacity-60 hover:opacity-100"
                                }
                              >
                                {ROLE_LABEL[r]}
                              </Badge>
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-2 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => remove(u)}
                        title="Excluir usuário"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-muted-foreground mt-3">
              Clique em uma função para atribuir ou remover. Um usuário precisa ter ao menos uma função.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}