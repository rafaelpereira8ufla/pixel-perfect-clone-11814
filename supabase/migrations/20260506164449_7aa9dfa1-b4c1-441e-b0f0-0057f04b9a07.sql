
-- Enums
create type public.app_role as enum ('paciente','recepcionista','medico','gestor');
create type public.consulta_modalidade as enum ('presencial','telemedicina');
create type public.consulta_status as enum ('agendado','confirmado','realizado','cancelado','link_enviado');
create type public.forma_pagamento as enum ('dinheiro','cartao','convenio');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  cpf text,
  telefone text,
  data_nascimento date,
  email text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

-- Medicos
create table public.medicos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  nome text not null,
  especialidade text not null,
  crm text not null unique,
  email text,
  created_at timestamptz not null default now()
);
alter table public.medicos enable row level security;

-- Horarios
create table public.horarios_disponiveis (
  id uuid primary key default gen_random_uuid(),
  medico_id uuid not null references public.medicos(id) on delete cascade,
  data date not null,
  hora_inicio time not null,
  hora_fim time not null,
  disponivel boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.horarios_disponiveis enable row level security;
create index on public.horarios_disponiveis(medico_id, data);

-- Consultas
create table public.consultas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.profiles(id) on delete cascade,
  medico_id uuid not null references public.medicos(id) on delete cascade,
  horario_id uuid references public.horarios_disponiveis(id) on delete set null,
  modalidade public.consulta_modalidade not null,
  status public.consulta_status not null default 'agendado',
  link_telemedicina text,
  data_consulta timestamptz not null,
  created_at timestamptz not null default now()
);
alter table public.consultas enable row level security;
create index on public.consultas(paciente_id);
create index on public.consultas(medico_id);

-- Resultados
create table public.resultados_consulta (
  id uuid primary key default gen_random_uuid(),
  consulta_id uuid not null references public.consultas(id) on delete cascade,
  medico_id uuid not null references public.medicos(id) on delete cascade,
  descricao text not null,
  publicado_em timestamptz not null default now()
);
alter table public.resultados_consulta enable row level security;

-- Pagamentos
create table public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  consulta_id uuid not null references public.consultas(id) on delete cascade,
  valor numeric(10,2) not null,
  forma_pagamento public.forma_pagamento not null,
  nota_fiscal_gerada boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.pagamentos enable row level security;

-- Profile auto-create + default 'paciente' role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome, email, cpf, telefone, data_nascimento)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    new.email,
    new.raw_user_meta_data->>'cpf',
    new.raw_user_meta_data->>'telefone',
    nullif(new.raw_user_meta_data->>'data_nascimento','')::date
  );
  insert into public.user_roles(user_id, role) values (new.id, 'paciente');
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS POLICIES

-- profiles
create policy "users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "staff view all profiles" on public.profiles for select using (
  public.has_role(auth.uid(),'recepcionista') or public.has_role(auth.uid(),'medico') or public.has_role(auth.uid(),'gestor')
);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "recep insert profiles" on public.profiles for insert with check (public.has_role(auth.uid(),'recepcionista'));

-- user_roles: only gestor can manage; users can read own
create policy "users read own roles" on public.user_roles for select using (auth.uid() = user_id);
create policy "gestor manage roles" on public.user_roles for all using (public.has_role(auth.uid(),'gestor')) with check (public.has_role(auth.uid(),'gestor'));

-- medicos: anyone authenticated can read
create policy "auth read medicos" on public.medicos for select to authenticated using (true);
create policy "gestor manage medicos" on public.medicos for all using (public.has_role(auth.uid(),'gestor')) with check (public.has_role(auth.uid(),'gestor'));

-- horarios: anyone auth can read; recep/gestor manage; medico can manage own
create policy "auth read horarios" on public.horarios_disponiveis for select to authenticated using (true);
create policy "staff manage horarios" on public.horarios_disponiveis for all using (
  public.has_role(auth.uid(),'recepcionista') or public.has_role(auth.uid(),'gestor')
) with check (
  public.has_role(auth.uid(),'recepcionista') or public.has_role(auth.uid(),'gestor')
);

-- consultas
create policy "paciente view own consultas" on public.consultas for select using (paciente_id = auth.uid());
create policy "staff view consultas" on public.consultas for select using (
  public.has_role(auth.uid(),'recepcionista') or public.has_role(auth.uid(),'gestor') or public.has_role(auth.uid(),'medico')
);
create policy "paciente insert own consultas" on public.consultas for insert with check (paciente_id = auth.uid());
create policy "recep insert consultas" on public.consultas for insert with check (public.has_role(auth.uid(),'recepcionista'));
create policy "paciente update own consultas" on public.consultas for update using (paciente_id = auth.uid());
create policy "staff update consultas" on public.consultas for update using (
  public.has_role(auth.uid(),'recepcionista') or public.has_role(auth.uid(),'gestor') or public.has_role(auth.uid(),'medico')
);

-- resultados
create policy "paciente view own resultados" on public.resultados_consulta for select using (
  exists(select 1 from public.consultas c where c.id = consulta_id and c.paciente_id = auth.uid())
);
create policy "staff view resultados" on public.resultados_consulta for select using (
  public.has_role(auth.uid(),'medico') or public.has_role(auth.uid(),'gestor') or public.has_role(auth.uid(),'recepcionista')
);
create policy "medico insert resultados" on public.resultados_consulta for insert with check (
  public.has_role(auth.uid(),'medico')
);

-- pagamentos
create policy "staff view pagamentos" on public.pagamentos for select using (
  public.has_role(auth.uid(),'recepcionista') or public.has_role(auth.uid(),'gestor')
);
create policy "recep insert pagamentos" on public.pagamentos for insert with check (
  public.has_role(auth.uid(),'recepcionista')
);
create policy "recep update pagamentos" on public.pagamentos for update using (
  public.has_role(auth.uid(),'recepcionista')
);
