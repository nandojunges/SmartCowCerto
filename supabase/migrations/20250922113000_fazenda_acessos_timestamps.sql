begin;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.fazenda_acessos
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.repro_eventos
  add column if not exists evento_pai_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'repro_eventos_evento_pai_fk'
  ) then
    alter table public.repro_eventos
      add constraint repro_eventos_evento_pai_fk
      foreign key (evento_pai_id)
      references public.repro_eventos(id)
      on delete set null;
  end if;
end $$;

create index if not exists repro_eventos_fazenda_animal_tipo_data_evento_idx
  on public.repro_eventos (fazenda_id, animal_id, tipo, data_evento desc);

create index if not exists repro_eventos_fazenda_evento_pai_idx
  on public.repro_eventos (fazenda_id, evento_pai_id);

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_fazenda_acessos_updated_at'
  ) then
    create trigger trg_fazenda_acessos_updated_at
    before update on public.fazenda_acessos
    for each row
    execute function public.set_updated_at();
  end if;
end $$;

commit;
