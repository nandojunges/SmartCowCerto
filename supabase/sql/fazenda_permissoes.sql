create table if not exists public.fazenda_permissoes (
  fazenda_id uuid not null references public.fazendas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  modulo text not null,
  pode_ver boolean not null default false,
  pode_editar boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (fazenda_id, user_id, modulo),
  constraint fazenda_permissoes_editar_depende_ver
    check ((not pode_editar) or pode_ver)
);

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_fazenda_permissoes_updated_at on public.fazenda_permissoes;
create trigger trg_fazenda_permissoes_updated_at
before update on public.fazenda_permissoes
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.fazenda_permissoes enable row level security;

drop policy if exists "fazenda_permissoes_owner_manage" on public.fazenda_permissoes;
create policy "fazenda_permissoes_owner_manage"
  on public.fazenda_permissoes
  for all
  using (
    exists (
      select 1
      from public.fazendas
      where fazendas.id = fazenda_permissoes.fazenda_id
        and fazendas.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas
      where fazendas.id = fazenda_permissoes.fazenda_id
        and fazendas.owner_id = auth.uid()
    )
  );

drop policy if exists "fazenda_permissoes_user_read_own" on public.fazenda_permissoes;
create policy "fazenda_permissoes_user_read_own"
  on public.fazenda_permissoes
  for select
  using (user_id = auth.uid());
