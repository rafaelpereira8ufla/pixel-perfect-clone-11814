import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

const ROLE = z.enum(['paciente', 'recepcionista', 'medico', 'gestor']);

async function assertGestor(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'gestor')
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Acesso negado: somente gestor.');
}

const CreateStaffInput = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  nome: z.string().min(1).max(120),
  role: ROLE,
  cpf: z.string().max(20).optional().nullable(),
  telefone: z.string().max(30).optional().nullable(),
  especialidade: z.string().max(120).optional().nullable(),
  crm: z.string().max(40).optional().nullable(),
});

export const createStaffUser = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateStaffInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertGestor(context.supabase, context.userId);

    if (data.role === 'medico' && (!data.crm || !data.especialidade)) {
      throw new Error('Médicos exigem CRM e especialidade.');
    }

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        nome: data.nome,
        cpf: data.cpf ?? null,
        telefone: data.telefone ?? null,
      },
    });
    if (createErr || !created.user) {
      throw new Error(createErr?.message ?? 'Falha ao criar usuário.');
    }
    const newUserId = created.user.id;

    // O trigger handle_new_user já cria profile + role 'paciente'.
    // Se a função for diferente, removemos 'paciente' e adicionamos a real.
    if (data.role !== 'paciente') {
      await supabaseAdmin.from('user_roles').delete().eq('user_id', newUserId).eq('role', 'paciente');
      const { error: roleErr } = await supabaseAdmin.from('user_roles').insert({
        user_id: newUserId,
        role: data.role,
      });
      if (roleErr) throw new Error(roleErr.message);
    }

    if (data.role === 'medico') {
      const { error: medErr } = await supabaseAdmin.from('medicos').insert({
        user_id: newUserId,
        nome: data.nome,
        email: data.email,
        crm: data.crm!,
        especialidade: data.especialidade!,
      });
      if (medErr) throw new Error(medErr.message);
    }

    return { ok: true, userId: newUserId };
  });

export const listStaffUsers = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertGestor(context.supabase, context.userId);

    const { data: roles, error: rErr } = await supabaseAdmin
      .from('user_roles')
      .select('user_id, role');
    if (rErr) throw new Error(rErr.message);

    const { data: profiles, error: pErr } = await supabaseAdmin
      .from('profiles')
      .select('id, nome, email, telefone, cpf');
    if (pErr) throw new Error(pErr.message);

    const profileById = new Map(profiles?.map((p) => [p.id, p]) ?? []);
    const grouped = new Map<string, { id: string; nome: string; email: string | null; roles: string[] }>();
    for (const r of roles ?? []) {
      const p = profileById.get(r.user_id);
      const entry = grouped.get(r.user_id) ?? {
        id: r.user_id,
        nome: p?.nome ?? '—',
        email: p?.email ?? null,
        roles: [],
      };
      entry.roles.push(r.role as string);
      grouped.set(r.user_id, entry);
    }
    return { users: Array.from(grouped.values()).sort((a, b) => a.nome.localeCompare(b.nome)) };
  });

const SetRolesInput = z.object({
  userId: z.string().uuid(),
  roles: z.array(ROLE).min(1).max(4),
});

export const setUserRoles = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SetRolesInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertGestor(context.supabase, context.userId);
    if (data.userId === context.userId && !data.roles.includes('gestor')) {
      throw new Error('Você não pode remover seu próprio papel de gestor.');
    }
    const { error: delErr } = await supabaseAdmin.from('user_roles').delete().eq('user_id', data.userId);
    if (delErr) throw new Error(delErr.message);
    const { error: insErr } = await supabaseAdmin.from('user_roles').insert(
      data.roles.map((role) => ({ user_id: data.userId, role })),
    );
    if (insErr) throw new Error(insErr.message);
    return { ok: true };
  });

const DeleteInput = z.object({ userId: z.string().uuid() });

export const deleteStaffUser = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => DeleteInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertGestor(context.supabase, context.userId);
    if (data.userId === context.userId) {
      throw new Error('Você não pode excluir a si mesmo.');
    }
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });