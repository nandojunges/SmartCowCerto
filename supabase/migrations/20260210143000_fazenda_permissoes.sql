begin;

create table if not exists public.fazenda_permissoes (
  id bigserial primary key,
  fazenda_id uuid not null references public.fazendas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  modulo text not null,
  pode_ver boolean not null default false,
  pode_editar boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint fazenda_permissoes_fazenda_user_modulo_key unique (fazenda_id, user_id, modulo),
  constraint fazenda_permissoes_ver_editar_check check (pode_ver or not pode_editar)
);

create index if not exists fazenda_permissoes_fazenda_user_idx
  on public.fazenda_permissoes (fazenda_id, user_id);

create index if not exists fazenda_permissoes_modulo_idx
  on public.fazenda_permissoes (modulo);

create or replace function public.set_updated_at_fazenda_permissoes()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_set_updated_at_fazenda_permissoes on public.fazenda_permissoes;
create trigger trg_set_updated_at_fazenda_permissoes
before update on public.fazenda_permissoes
for each row
execute function public.set_updated_at_fazenda_permissoes();

alter table public.fazenda_permissoes enable row level security;

-- owner da fazenda pode gerenciar permissões
create policy fazenda_permissoes_owner_select
on public.fazenda_permissoes
for select
using (
  exists (
    select 1
    from public.fazendas f
    where f.id = fazenda_permissoes.fazenda_id
      and f.owner_user_id = auth.uid()
  )
);

create policy fazenda_permissoes_owner_insert
on public.fazenda_permissoes
for insert
with check (
  exists (
    select 1
    from public.fazendas f
    where f.id = fazenda_permissoes.fazenda_id
      and f.owner_user_id = auth.uid()
  )
);

create policy fazenda_permissoes_owner_update
on public.fazenda_permissoes
for update
using (
  exists (
    select 1
    from public.fazendas f
    where f.id = fazenda_permissoes.fazenda_id
      and f.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.fazendas f
    where f.id = fazenda_permissoes.fazenda_id
      and f.owner_user_id = auth.uid()
  )
);

create policy fazenda_permissoes_owner_delete
on public.fazenda_permissoes
for delete
using (
  exists (
    select 1
    from public.fazendas f
    where f.id = fazenda_permissoes.fazenda_id
      and f.owner_user_id = auth.uid()
  )
);

-- usuário pode ler apenas as próprias permissões
create policy fazenda_permissoes_user_select_own
on public.fazenda_permissoes
for select
using (user_id = auth.uid());

commit;
