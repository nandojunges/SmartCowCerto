-- Ajusta RLS de inseminadores para acesso por fazenda (owner ou acesso ativo)
alter table if exists public.inseminadores enable row level security;

drop policy if exists inseminadores_select on public.inseminadores;
drop policy if exists inseminadores_insert on public.inseminadores;
drop policy if exists inseminadores_update on public.inseminadores;
drop policy if exists inseminadores_delete on public.inseminadores;

create policy inseminadores_select
  on public.inseminadores
  for select
  using (public.tem_acesso_fazenda(fazenda_id));

create policy inseminadores_insert
  on public.inseminadores
  for insert
  with check (public.tem_acesso_fazenda(fazenda_id));

create policy inseminadores_update
  on public.inseminadores
  for update
  using (public.tem_acesso_fazenda(fazenda_id))
  with check (public.tem_acesso_fazenda(fazenda_id));

create policy inseminadores_delete
  on public.inseminadores
  for delete
  using (public.tem_acesso_fazenda(fazenda_id));
