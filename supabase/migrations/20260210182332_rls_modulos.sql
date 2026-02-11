-- RLS por módulo (gerado automaticamente a partir dos usos .from no front-end).

-- animais => módulo animais
alter table public.animais enable row level security;

drop policy if exists animais_select_modulo on public.animais;
create policy animais_select_modulo
  on public.animais
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.animais.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.animais.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.animais.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists animais_insert_modulo on public.animais;
create policy animais_insert_modulo
  on public.animais
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.animais.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.animais.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.animais.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists animais_update_modulo on public.animais;
create policy animais_update_modulo
  on public.animais
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.animais.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.animais.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.animais.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.animais.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.animais.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.animais.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists animais_delete_modulo on public.animais;
create policy animais_delete_modulo
  on public.animais
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.animais.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.animais.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.animais.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );


-- animais_lote_historico => módulo animais
alter table public.animais_lote_historico enable row level security;

drop policy if exists animais_lote_historico_select_modulo on public.animais_lote_historico;
create policy animais_lote_historico_select_modulo
  on public.animais_lote_historico
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.animais_lote_historico.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.animais_lote_historico.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.animais_lote_historico.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists animais_lote_historico_insert_modulo on public.animais_lote_historico;
create policy animais_lote_historico_insert_modulo
  on public.animais_lote_historico
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.animais_lote_historico.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.animais_lote_historico.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.animais_lote_historico.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists animais_lote_historico_update_modulo on public.animais_lote_historico;
create policy animais_lote_historico_update_modulo
  on public.animais_lote_historico
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.animais_lote_historico.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.animais_lote_historico.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.animais_lote_historico.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.animais_lote_historico.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.animais_lote_historico.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.animais_lote_historico.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists animais_lote_historico_delete_modulo on public.animais_lote_historico;
create policy animais_lote_historico_delete_modulo
  on public.animais_lote_historico
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.animais_lote_historico.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.animais_lote_historico.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.animais_lote_historico.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );


-- config_animais => módulo animais
alter table public.config_animais enable row level security;

drop policy if exists config_animais_select_modulo on public.config_animais;
create policy config_animais_select_modulo
  on public.config_animais
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.config_animais.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.config_animais.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.config_animais.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists config_animais_insert_modulo on public.config_animais;
create policy config_animais_insert_modulo
  on public.config_animais
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.config_animais.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.config_animais.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.config_animais.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists config_animais_update_modulo on public.config_animais;
create policy config_animais_update_modulo
  on public.config_animais
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.config_animais.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.config_animais.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.config_animais.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.config_animais.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.config_animais.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.config_animais.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists config_animais_delete_modulo on public.config_animais;
create policy config_animais_delete_modulo
  on public.config_animais
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.config_animais.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.config_animais.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.config_animais.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );


-- config_manejo_repro => módulo animais
alter table public.config_manejo_repro enable row level security;

drop policy if exists config_manejo_repro_select_modulo on public.config_manejo_repro;
create policy config_manejo_repro_select_modulo
  on public.config_manejo_repro
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.config_manejo_repro.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.config_manejo_repro.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.config_manejo_repro.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists config_manejo_repro_insert_modulo on public.config_manejo_repro;
create policy config_manejo_repro_insert_modulo
  on public.config_manejo_repro
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.config_manejo_repro.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.config_manejo_repro.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.config_manejo_repro.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists config_manejo_repro_update_modulo on public.config_manejo_repro;
create policy config_manejo_repro_update_modulo
  on public.config_manejo_repro
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.config_manejo_repro.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.config_manejo_repro.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.config_manejo_repro.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.config_manejo_repro.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.config_manejo_repro.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.config_manejo_repro.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists config_manejo_repro_delete_modulo on public.config_manejo_repro;
create policy config_manejo_repro_delete_modulo
  on public.config_manejo_repro
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.config_manejo_repro.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.config_manejo_repro.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.config_manejo_repro.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );


-- lotes => módulo animais
alter table public.lotes enable row level security;

drop policy if exists lotes_select_modulo on public.lotes;
create policy lotes_select_modulo
  on public.lotes
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.lotes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.lotes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.lotes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists lotes_insert_modulo on public.lotes;
create policy lotes_insert_modulo
  on public.lotes
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.lotes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.lotes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.lotes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists lotes_update_modulo on public.lotes;
create policy lotes_update_modulo
  on public.lotes
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.lotes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.lotes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.lotes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.lotes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.lotes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.lotes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists lotes_delete_modulo on public.lotes;
create policy lotes_delete_modulo
  on public.lotes
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.lotes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.lotes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.lotes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );


-- saidas_animais => módulo animais
alter table public.saidas_animais enable row level security;

drop policy if exists saidas_animais_select_modulo on public.saidas_animais;
create policy saidas_animais_select_modulo
  on public.saidas_animais
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.saidas_animais.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.saidas_animais.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.saidas_animais.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists saidas_animais_insert_modulo on public.saidas_animais;
create policy saidas_animais_insert_modulo
  on public.saidas_animais
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.saidas_animais.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.saidas_animais.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.saidas_animais.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists saidas_animais_update_modulo on public.saidas_animais;
create policy saidas_animais_update_modulo
  on public.saidas_animais
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.saidas_animais.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.saidas_animais.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.saidas_animais.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.saidas_animais.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.saidas_animais.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.saidas_animais.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists saidas_animais_delete_modulo on public.saidas_animais;
create policy saidas_animais_delete_modulo
  on public.saidas_animais
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.saidas_animais.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.saidas_animais.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.saidas_animais.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );


-- secagens => módulo animais
alter table public.secagens enable row level security;

drop policy if exists secagens_select_modulo on public.secagens;
create policy secagens_select_modulo
  on public.secagens
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.secagens.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.secagens.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.secagens.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists secagens_insert_modulo on public.secagens;
create policy secagens_insert_modulo
  on public.secagens
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.secagens.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.secagens.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.secagens.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists secagens_update_modulo on public.secagens;
create policy secagens_update_modulo
  on public.secagens
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.secagens.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.secagens.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.secagens.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.secagens.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.secagens.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.secagens.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists secagens_delete_modulo on public.secagens;
create policy secagens_delete_modulo
  on public.secagens
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.secagens.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.secagens.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.secagens.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );


-- pos_parto_eventos => módulo animais
alter table public.pos_parto_eventos enable row level security;

drop policy if exists pos_parto_eventos_select_modulo on public.pos_parto_eventos;
create policy pos_parto_eventos_select_modulo
  on public.pos_parto_eventos
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.pos_parto_eventos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.pos_parto_eventos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.pos_parto_eventos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists pos_parto_eventos_insert_modulo on public.pos_parto_eventos;
create policy pos_parto_eventos_insert_modulo
  on public.pos_parto_eventos
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.pos_parto_eventos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.pos_parto_eventos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.pos_parto_eventos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists pos_parto_eventos_update_modulo on public.pos_parto_eventos;
create policy pos_parto_eventos_update_modulo
  on public.pos_parto_eventos
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.pos_parto_eventos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.pos_parto_eventos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.pos_parto_eventos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.pos_parto_eventos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.pos_parto_eventos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.pos_parto_eventos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists pos_parto_eventos_delete_modulo on public.pos_parto_eventos;
create policy pos_parto_eventos_delete_modulo
  on public.pos_parto_eventos
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.pos_parto_eventos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.pos_parto_eventos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.pos_parto_eventos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );


-- racas => módulo animais
alter table public.racas enable row level security;

drop policy if exists racas_select_modulo on public.racas;
create policy racas_select_modulo
  on public.racas
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.racas.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.racas.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.racas.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists racas_insert_modulo on public.racas;
create policy racas_insert_modulo
  on public.racas
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.racas.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.racas.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.racas.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists racas_update_modulo on public.racas;
create policy racas_update_modulo
  on public.racas
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.racas.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.racas.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.racas.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.racas.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.racas.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.racas.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists racas_delete_modulo on public.racas;
create policy racas_delete_modulo
  on public.racas
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.racas.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.racas.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.racas.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'animais'
          and fp.pode_editar = true
      )
    )
  );


-- repro_eventos => módulo reproducao
alter table public.repro_eventos enable row level security;

drop policy if exists repro_eventos_select_modulo on public.repro_eventos;
create policy repro_eventos_select_modulo
  on public.repro_eventos
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_eventos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_eventos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_eventos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists repro_eventos_insert_modulo on public.repro_eventos;
create policy repro_eventos_insert_modulo
  on public.repro_eventos
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_eventos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_eventos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_eventos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists repro_eventos_update_modulo on public.repro_eventos;
create policy repro_eventos_update_modulo
  on public.repro_eventos
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_eventos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_eventos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_eventos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_eventos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_eventos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_eventos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists repro_eventos_delete_modulo on public.repro_eventos;
create policy repro_eventos_delete_modulo
  on public.repro_eventos
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_eventos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_eventos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_eventos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  );


-- repro_aplicacoes => módulo reproducao
alter table public.repro_aplicacoes enable row level security;

drop policy if exists repro_aplicacoes_select_modulo on public.repro_aplicacoes;
create policy repro_aplicacoes_select_modulo
  on public.repro_aplicacoes
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_aplicacoes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_aplicacoes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_aplicacoes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists repro_aplicacoes_insert_modulo on public.repro_aplicacoes;
create policy repro_aplicacoes_insert_modulo
  on public.repro_aplicacoes
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_aplicacoes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_aplicacoes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_aplicacoes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists repro_aplicacoes_update_modulo on public.repro_aplicacoes;
create policy repro_aplicacoes_update_modulo
  on public.repro_aplicacoes
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_aplicacoes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_aplicacoes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_aplicacoes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_aplicacoes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_aplicacoes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_aplicacoes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists repro_aplicacoes_delete_modulo on public.repro_aplicacoes;
create policy repro_aplicacoes_delete_modulo
  on public.repro_aplicacoes
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_aplicacoes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_aplicacoes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_aplicacoes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  );


-- repro_grupos_presync => módulo reproducao
alter table public.repro_grupos_presync enable row level security;

drop policy if exists repro_grupos_presync_select_modulo on public.repro_grupos_presync;
create policy repro_grupos_presync_select_modulo
  on public.repro_grupos_presync
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_grupos_presync.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_grupos_presync.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_grupos_presync.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists repro_grupos_presync_insert_modulo on public.repro_grupos_presync;
create policy repro_grupos_presync_insert_modulo
  on public.repro_grupos_presync
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_grupos_presync.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_grupos_presync.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_grupos_presync.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists repro_grupos_presync_update_modulo on public.repro_grupos_presync;
create policy repro_grupos_presync_update_modulo
  on public.repro_grupos_presync
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_grupos_presync.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_grupos_presync.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_grupos_presync.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_grupos_presync.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_grupos_presync.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_grupos_presync.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists repro_grupos_presync_delete_modulo on public.repro_grupos_presync;
create policy repro_grupos_presync_delete_modulo
  on public.repro_grupos_presync
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_grupos_presync.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_grupos_presync.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_grupos_presync.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  );


-- repro_partos => módulo reproducao
alter table public.repro_partos enable row level security;

drop policy if exists repro_partos_select_modulo on public.repro_partos;
create policy repro_partos_select_modulo
  on public.repro_partos
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_partos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_partos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_partos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists repro_partos_insert_modulo on public.repro_partos;
create policy repro_partos_insert_modulo
  on public.repro_partos
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_partos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_partos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_partos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists repro_partos_update_modulo on public.repro_partos;
create policy repro_partos_update_modulo
  on public.repro_partos
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_partos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_partos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_partos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_partos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_partos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_partos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists repro_partos_delete_modulo on public.repro_partos;
create policy repro_partos_delete_modulo
  on public.repro_partos
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_partos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_partos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_partos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  );


-- repro_protocolos => módulo reproducao
alter table public.repro_protocolos enable row level security;

drop policy if exists repro_protocolos_select_modulo on public.repro_protocolos;
create policy repro_protocolos_select_modulo
  on public.repro_protocolos
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_protocolos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_protocolos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_protocolos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists repro_protocolos_insert_modulo on public.repro_protocolos;
create policy repro_protocolos_insert_modulo
  on public.repro_protocolos
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_protocolos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_protocolos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_protocolos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists repro_protocolos_update_modulo on public.repro_protocolos;
create policy repro_protocolos_update_modulo
  on public.repro_protocolos
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_protocolos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_protocolos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_protocolos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_protocolos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_protocolos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_protocolos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists repro_protocolos_delete_modulo on public.repro_protocolos;
create policy repro_protocolos_delete_modulo
  on public.repro_protocolos
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.repro_protocolos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.repro_protocolos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.repro_protocolos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  );


-- inseminadores => módulo reproducao
alter table public.inseminadores enable row level security;

drop policy if exists inseminadores_select_modulo on public.inseminadores;
create policy inseminadores_select_modulo
  on public.inseminadores
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.inseminadores.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.inseminadores.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.inseminadores.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists inseminadores_insert_modulo on public.inseminadores;
create policy inseminadores_insert_modulo
  on public.inseminadores
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.inseminadores.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.inseminadores.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.inseminadores.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists inseminadores_update_modulo on public.inseminadores;
create policy inseminadores_update_modulo
  on public.inseminadores
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.inseminadores.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.inseminadores.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.inseminadores.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.inseminadores.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.inseminadores.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.inseminadores.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists inseminadores_delete_modulo on public.inseminadores;
create policy inseminadores_delete_modulo
  on public.inseminadores
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.inseminadores.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.inseminadores.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.inseminadores.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'reproducao'
          and fp.pode_editar = true
      )
    )
  );


-- leite_ccs_registros => módulo leite
alter table public.leite_ccs_registros enable row level security;

drop policy if exists leite_ccs_registros_select_modulo on public.leite_ccs_registros;
create policy leite_ccs_registros_select_modulo
  on public.leite_ccs_registros
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_ccs_registros.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_ccs_registros.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_ccs_registros.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists leite_ccs_registros_insert_modulo on public.leite_ccs_registros;
create policy leite_ccs_registros_insert_modulo
  on public.leite_ccs_registros
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_ccs_registros.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_ccs_registros.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_ccs_registros.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists leite_ccs_registros_update_modulo on public.leite_ccs_registros;
create policy leite_ccs_registros_update_modulo
  on public.leite_ccs_registros
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_ccs_registros.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_ccs_registros.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_ccs_registros.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_ccs_registros.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_ccs_registros.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_ccs_registros.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists leite_ccs_registros_delete_modulo on public.leite_ccs_registros;
create policy leite_ccs_registros_delete_modulo
  on public.leite_ccs_registros
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_ccs_registros.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_ccs_registros.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_ccs_registros.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  );


-- leite_cmt_quartos => módulo leite
alter table public.leite_cmt_quartos enable row level security;

drop policy if exists leite_cmt_quartos_select_modulo on public.leite_cmt_quartos;
create policy leite_cmt_quartos_select_modulo
  on public.leite_cmt_quartos
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_cmt_quartos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_cmt_quartos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_cmt_quartos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists leite_cmt_quartos_insert_modulo on public.leite_cmt_quartos;
create policy leite_cmt_quartos_insert_modulo
  on public.leite_cmt_quartos
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_cmt_quartos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_cmt_quartos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_cmt_quartos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists leite_cmt_quartos_update_modulo on public.leite_cmt_quartos;
create policy leite_cmt_quartos_update_modulo
  on public.leite_cmt_quartos
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_cmt_quartos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_cmt_quartos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_cmt_quartos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_cmt_quartos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_cmt_quartos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_cmt_quartos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists leite_cmt_quartos_delete_modulo on public.leite_cmt_quartos;
create policy leite_cmt_quartos_delete_modulo
  on public.leite_cmt_quartos
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_cmt_quartos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_cmt_quartos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_cmt_quartos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  );


-- leite_cmt_testes => módulo leite
alter table public.leite_cmt_testes enable row level security;

drop policy if exists leite_cmt_testes_select_modulo on public.leite_cmt_testes;
create policy leite_cmt_testes_select_modulo
  on public.leite_cmt_testes
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_cmt_testes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_cmt_testes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_cmt_testes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists leite_cmt_testes_insert_modulo on public.leite_cmt_testes;
create policy leite_cmt_testes_insert_modulo
  on public.leite_cmt_testes
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_cmt_testes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_cmt_testes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_cmt_testes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists leite_cmt_testes_update_modulo on public.leite_cmt_testes;
create policy leite_cmt_testes_update_modulo
  on public.leite_cmt_testes
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_cmt_testes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_cmt_testes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_cmt_testes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_cmt_testes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_cmt_testes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_cmt_testes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists leite_cmt_testes_delete_modulo on public.leite_cmt_testes;
create policy leite_cmt_testes_delete_modulo
  on public.leite_cmt_testes
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_cmt_testes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_cmt_testes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_cmt_testes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  );


-- leite_laboratorios => módulo leite
alter table public.leite_laboratorios enable row level security;

drop policy if exists leite_laboratorios_select_modulo on public.leite_laboratorios;
create policy leite_laboratorios_select_modulo
  on public.leite_laboratorios
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_laboratorios.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_laboratorios.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_laboratorios.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists leite_laboratorios_insert_modulo on public.leite_laboratorios;
create policy leite_laboratorios_insert_modulo
  on public.leite_laboratorios
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_laboratorios.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_laboratorios.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_laboratorios.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists leite_laboratorios_update_modulo on public.leite_laboratorios;
create policy leite_laboratorios_update_modulo
  on public.leite_laboratorios
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_laboratorios.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_laboratorios.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_laboratorios.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_laboratorios.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_laboratorios.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_laboratorios.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists leite_laboratorios_delete_modulo on public.leite_laboratorios;
create policy leite_laboratorios_delete_modulo
  on public.leite_laboratorios
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_laboratorios.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_laboratorios.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_laboratorios.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  );


-- leite_responsaveis => módulo leite
alter table public.leite_responsaveis enable row level security;

drop policy if exists leite_responsaveis_select_modulo on public.leite_responsaveis;
create policy leite_responsaveis_select_modulo
  on public.leite_responsaveis
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_responsaveis.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_responsaveis.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_responsaveis.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists leite_responsaveis_insert_modulo on public.leite_responsaveis;
create policy leite_responsaveis_insert_modulo
  on public.leite_responsaveis
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_responsaveis.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_responsaveis.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_responsaveis.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists leite_responsaveis_update_modulo on public.leite_responsaveis;
create policy leite_responsaveis_update_modulo
  on public.leite_responsaveis
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_responsaveis.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_responsaveis.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_responsaveis.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_responsaveis.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_responsaveis.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_responsaveis.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists leite_responsaveis_delete_modulo on public.leite_responsaveis;
create policy leite_responsaveis_delete_modulo
  on public.leite_responsaveis
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.leite_responsaveis.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.leite_responsaveis.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.leite_responsaveis.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  );


-- medicoes_leite => módulo leite
alter table public.medicoes_leite enable row level security;

drop policy if exists medicoes_leite_select_modulo on public.medicoes_leite;
create policy medicoes_leite_select_modulo
  on public.medicoes_leite
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.medicoes_leite.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.medicoes_leite.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.medicoes_leite.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists medicoes_leite_insert_modulo on public.medicoes_leite;
create policy medicoes_leite_insert_modulo
  on public.medicoes_leite
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.medicoes_leite.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.medicoes_leite.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.medicoes_leite.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists medicoes_leite_update_modulo on public.medicoes_leite;
create policy medicoes_leite_update_modulo
  on public.medicoes_leite
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.medicoes_leite.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.medicoes_leite.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.medicoes_leite.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.medicoes_leite.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.medicoes_leite.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.medicoes_leite.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists medicoes_leite_delete_modulo on public.medicoes_leite;
create policy medicoes_leite_delete_modulo
  on public.medicoes_leite
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.medicoes_leite.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.medicoes_leite.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.medicoes_leite.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'leite'
          and fp.pode_editar = true
      )
    )
  );


-- saude_aplicacoes => módulo saude
alter table public.saude_aplicacoes enable row level security;

drop policy if exists saude_aplicacoes_select_modulo on public.saude_aplicacoes;
create policy saude_aplicacoes_select_modulo
  on public.saude_aplicacoes
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.saude_aplicacoes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.saude_aplicacoes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.saude_aplicacoes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'saude'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists saude_aplicacoes_insert_modulo on public.saude_aplicacoes;
create policy saude_aplicacoes_insert_modulo
  on public.saude_aplicacoes
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.saude_aplicacoes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.saude_aplicacoes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.saude_aplicacoes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'saude'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists saude_aplicacoes_update_modulo on public.saude_aplicacoes;
create policy saude_aplicacoes_update_modulo
  on public.saude_aplicacoes
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.saude_aplicacoes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.saude_aplicacoes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.saude_aplicacoes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'saude'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.saude_aplicacoes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.saude_aplicacoes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.saude_aplicacoes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'saude'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists saude_aplicacoes_delete_modulo on public.saude_aplicacoes;
create policy saude_aplicacoes_delete_modulo
  on public.saude_aplicacoes
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.saude_aplicacoes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.saude_aplicacoes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.saude_aplicacoes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'saude'
          and fp.pode_editar = true
      )
    )
  );


-- saude_protocolos => módulo saude
alter table public.saude_protocolos enable row level security;

drop policy if exists saude_protocolos_select_modulo on public.saude_protocolos;
create policy saude_protocolos_select_modulo
  on public.saude_protocolos
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.saude_protocolos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.saude_protocolos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.saude_protocolos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'saude'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists saude_protocolos_insert_modulo on public.saude_protocolos;
create policy saude_protocolos_insert_modulo
  on public.saude_protocolos
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.saude_protocolos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.saude_protocolos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.saude_protocolos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'saude'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists saude_protocolos_update_modulo on public.saude_protocolos;
create policy saude_protocolos_update_modulo
  on public.saude_protocolos
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.saude_protocolos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.saude_protocolos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.saude_protocolos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'saude'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.saude_protocolos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.saude_protocolos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.saude_protocolos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'saude'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists saude_protocolos_delete_modulo on public.saude_protocolos;
create policy saude_protocolos_delete_modulo
  on public.saude_protocolos
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.saude_protocolos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.saude_protocolos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.saude_protocolos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'saude'
          and fp.pode_editar = true
      )
    )
  );


-- saude_tratamentos => módulo saude
alter table public.saude_tratamentos enable row level security;

drop policy if exists saude_tratamentos_select_modulo on public.saude_tratamentos;
create policy saude_tratamentos_select_modulo
  on public.saude_tratamentos
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.saude_tratamentos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.saude_tratamentos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.saude_tratamentos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'saude'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists saude_tratamentos_insert_modulo on public.saude_tratamentos;
create policy saude_tratamentos_insert_modulo
  on public.saude_tratamentos
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.saude_tratamentos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.saude_tratamentos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.saude_tratamentos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'saude'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists saude_tratamentos_update_modulo on public.saude_tratamentos;
create policy saude_tratamentos_update_modulo
  on public.saude_tratamentos
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.saude_tratamentos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.saude_tratamentos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.saude_tratamentos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'saude'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.saude_tratamentos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.saude_tratamentos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.saude_tratamentos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'saude'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists saude_tratamentos_delete_modulo on public.saude_tratamentos;
create policy saude_tratamentos_delete_modulo
  on public.saude_tratamentos
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.saude_tratamentos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.saude_tratamentos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.saude_tratamentos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'saude'
          and fp.pode_editar = true
      )
    )
  );


-- estoque_produtos => módulo consumo
alter table public.estoque_produtos enable row level security;

drop policy if exists estoque_produtos_select_modulo on public.estoque_produtos;
create policy estoque_produtos_select_modulo
  on public.estoque_produtos
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.estoque_produtos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.estoque_produtos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.estoque_produtos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists estoque_produtos_insert_modulo on public.estoque_produtos;
create policy estoque_produtos_insert_modulo
  on public.estoque_produtos
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.estoque_produtos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.estoque_produtos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.estoque_produtos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists estoque_produtos_update_modulo on public.estoque_produtos;
create policy estoque_produtos_update_modulo
  on public.estoque_produtos
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.estoque_produtos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.estoque_produtos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.estoque_produtos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.estoque_produtos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.estoque_produtos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.estoque_produtos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists estoque_produtos_delete_modulo on public.estoque_produtos;
create policy estoque_produtos_delete_modulo
  on public.estoque_produtos
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.estoque_produtos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.estoque_produtos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.estoque_produtos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  );


-- estoque_lotes => módulo consumo
alter table public.estoque_lotes enable row level security;

drop policy if exists estoque_lotes_select_modulo on public.estoque_lotes;
create policy estoque_lotes_select_modulo
  on public.estoque_lotes
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.estoque_lotes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.estoque_lotes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.estoque_lotes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists estoque_lotes_insert_modulo on public.estoque_lotes;
create policy estoque_lotes_insert_modulo
  on public.estoque_lotes
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.estoque_lotes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.estoque_lotes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.estoque_lotes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists estoque_lotes_update_modulo on public.estoque_lotes;
create policy estoque_lotes_update_modulo
  on public.estoque_lotes
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.estoque_lotes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.estoque_lotes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.estoque_lotes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.estoque_lotes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.estoque_lotes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.estoque_lotes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists estoque_lotes_delete_modulo on public.estoque_lotes;
create policy estoque_lotes_delete_modulo
  on public.estoque_lotes
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.estoque_lotes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.estoque_lotes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.estoque_lotes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  );


-- estoque_movimentos => módulo consumo
alter table public.estoque_movimentos enable row level security;

drop policy if exists estoque_movimentos_select_modulo on public.estoque_movimentos;
create policy estoque_movimentos_select_modulo
  on public.estoque_movimentos
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.estoque_movimentos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.estoque_movimentos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.estoque_movimentos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists estoque_movimentos_insert_modulo on public.estoque_movimentos;
create policy estoque_movimentos_insert_modulo
  on public.estoque_movimentos
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.estoque_movimentos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.estoque_movimentos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.estoque_movimentos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists estoque_movimentos_update_modulo on public.estoque_movimentos;
create policy estoque_movimentos_update_modulo
  on public.estoque_movimentos
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.estoque_movimentos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.estoque_movimentos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.estoque_movimentos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.estoque_movimentos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.estoque_movimentos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.estoque_movimentos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists estoque_movimentos_delete_modulo on public.estoque_movimentos;
create policy estoque_movimentos_delete_modulo
  on public.estoque_movimentos
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.estoque_movimentos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.estoque_movimentos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.estoque_movimentos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  );


-- dietas => módulo consumo
alter table public.dietas enable row level security;

drop policy if exists dietas_select_modulo on public.dietas;
create policy dietas_select_modulo
  on public.dietas
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.dietas.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.dietas.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.dietas.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists dietas_insert_modulo on public.dietas;
create policy dietas_insert_modulo
  on public.dietas
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.dietas.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.dietas.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.dietas.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists dietas_update_modulo on public.dietas;
create policy dietas_update_modulo
  on public.dietas
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.dietas.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.dietas.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.dietas.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.dietas.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.dietas.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.dietas.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists dietas_delete_modulo on public.dietas;
create policy dietas_delete_modulo
  on public.dietas
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.dietas.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.dietas.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.dietas.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  );


-- dietas_itens => módulo consumo
alter table public.dietas_itens enable row level security;

drop policy if exists dietas_itens_select_modulo on public.dietas_itens;
create policy dietas_itens_select_modulo
  on public.dietas_itens
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.dietas_itens.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.dietas_itens.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.dietas_itens.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists dietas_itens_insert_modulo on public.dietas_itens;
create policy dietas_itens_insert_modulo
  on public.dietas_itens
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.dietas_itens.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.dietas_itens.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.dietas_itens.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists dietas_itens_update_modulo on public.dietas_itens;
create policy dietas_itens_update_modulo
  on public.dietas_itens
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.dietas_itens.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.dietas_itens.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.dietas_itens.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.dietas_itens.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.dietas_itens.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.dietas_itens.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists dietas_itens_delete_modulo on public.dietas_itens;
create policy dietas_itens_delete_modulo
  on public.dietas_itens
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.dietas_itens.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.dietas_itens.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.dietas_itens.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  );


-- limpeza_ciclos => módulo consumo
alter table public.limpeza_ciclos enable row level security;

drop policy if exists limpeza_ciclos_select_modulo on public.limpeza_ciclos;
create policy limpeza_ciclos_select_modulo
  on public.limpeza_ciclos
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.limpeza_ciclos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.limpeza_ciclos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.limpeza_ciclos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists limpeza_ciclos_insert_modulo on public.limpeza_ciclos;
create policy limpeza_ciclos_insert_modulo
  on public.limpeza_ciclos
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.limpeza_ciclos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.limpeza_ciclos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.limpeza_ciclos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists limpeza_ciclos_update_modulo on public.limpeza_ciclos;
create policy limpeza_ciclos_update_modulo
  on public.limpeza_ciclos
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.limpeza_ciclos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.limpeza_ciclos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.limpeza_ciclos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.limpeza_ciclos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.limpeza_ciclos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.limpeza_ciclos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists limpeza_ciclos_delete_modulo on public.limpeza_ciclos;
create policy limpeza_ciclos_delete_modulo
  on public.limpeza_ciclos
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.limpeza_ciclos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.limpeza_ciclos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.limpeza_ciclos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  );


-- limpeza_etapas => módulo consumo
alter table public.limpeza_etapas enable row level security;

drop policy if exists limpeza_etapas_select_modulo on public.limpeza_etapas;
create policy limpeza_etapas_select_modulo
  on public.limpeza_etapas
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.limpeza_etapas.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.limpeza_etapas.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.limpeza_etapas.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists limpeza_etapas_insert_modulo on public.limpeza_etapas;
create policy limpeza_etapas_insert_modulo
  on public.limpeza_etapas
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.limpeza_etapas.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.limpeza_etapas.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.limpeza_etapas.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists limpeza_etapas_update_modulo on public.limpeza_etapas;
create policy limpeza_etapas_update_modulo
  on public.limpeza_etapas
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.limpeza_etapas.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.limpeza_etapas.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.limpeza_etapas.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.limpeza_etapas.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.limpeza_etapas.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.limpeza_etapas.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists limpeza_etapas_delete_modulo on public.limpeza_etapas;
create policy limpeza_etapas_delete_modulo
  on public.limpeza_etapas
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.limpeza_etapas.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.limpeza_etapas.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.limpeza_etapas.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'consumo'
          and fp.pode_editar = true
      )
    )
  );


-- financeiro_lancamentos => módulo financeiro
alter table public.financeiro_lancamentos enable row level security;

drop policy if exists financeiro_lancamentos_select_modulo on public.financeiro_lancamentos;
create policy financeiro_lancamentos_select_modulo
  on public.financeiro_lancamentos
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.financeiro_lancamentos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.financeiro_lancamentos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.financeiro_lancamentos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'financeiro'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists financeiro_lancamentos_insert_modulo on public.financeiro_lancamentos;
create policy financeiro_lancamentos_insert_modulo
  on public.financeiro_lancamentos
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.financeiro_lancamentos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.financeiro_lancamentos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.financeiro_lancamentos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'financeiro'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists financeiro_lancamentos_update_modulo on public.financeiro_lancamentos;
create policy financeiro_lancamentos_update_modulo
  on public.financeiro_lancamentos
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.financeiro_lancamentos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.financeiro_lancamentos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.financeiro_lancamentos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'financeiro'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.financeiro_lancamentos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.financeiro_lancamentos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.financeiro_lancamentos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'financeiro'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists financeiro_lancamentos_delete_modulo on public.financeiro_lancamentos;
create policy financeiro_lancamentos_delete_modulo
  on public.financeiro_lancamentos
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.financeiro_lancamentos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.financeiro_lancamentos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.financeiro_lancamentos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'financeiro'
          and fp.pode_editar = true
      )
    )
  );


-- fazenda_config => módulo ajustes
alter table public.fazenda_config enable row level security;

drop policy if exists fazenda_config_select_modulo on public.fazenda_config;
create policy fazenda_config_select_modulo
  on public.fazenda_config
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.fazenda_config.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.fazenda_config.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.fazenda_config.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists fazenda_config_insert_modulo on public.fazenda_config;
create policy fazenda_config_insert_modulo
  on public.fazenda_config
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.fazenda_config.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.fazenda_config.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.fazenda_config.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists fazenda_config_update_modulo on public.fazenda_config;
create policy fazenda_config_update_modulo
  on public.fazenda_config
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.fazenda_config.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.fazenda_config.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.fazenda_config.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.fazenda_config.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.fazenda_config.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.fazenda_config.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists fazenda_config_delete_modulo on public.fazenda_config;
create policy fazenda_config_delete_modulo
  on public.fazenda_config
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.fazenda_config.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.fazenda_config.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.fazenda_config.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_editar = true
      )
    )
  );


-- fazenda_acessos => módulo ajustes
alter table public.fazenda_acessos enable row level security;

drop policy if exists fazenda_acessos_select_modulo on public.fazenda_acessos;
create policy fazenda_acessos_select_modulo
  on public.fazenda_acessos
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.fazenda_acessos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.fazenda_acessos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.fazenda_acessos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists fazenda_acessos_insert_modulo on public.fazenda_acessos;
create policy fazenda_acessos_insert_modulo
  on public.fazenda_acessos
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.fazenda_acessos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.fazenda_acessos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.fazenda_acessos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists fazenda_acessos_update_modulo on public.fazenda_acessos;
create policy fazenda_acessos_update_modulo
  on public.fazenda_acessos
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.fazenda_acessos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.fazenda_acessos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.fazenda_acessos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.fazenda_acessos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.fazenda_acessos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.fazenda_acessos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists fazenda_acessos_delete_modulo on public.fazenda_acessos;
create policy fazenda_acessos_delete_modulo
  on public.fazenda_acessos
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.fazenda_acessos.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.fazenda_acessos.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.fazenda_acessos.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_editar = true
      )
    )
  );


-- fazenda_permissoes => módulo ajustes
alter table public.fazenda_permissoes enable row level security;

drop policy if exists fazenda_permissoes_select_modulo on public.fazenda_permissoes;
create policy fazenda_permissoes_select_modulo
  on public.fazenda_permissoes
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.fazenda_permissoes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.fazenda_permissoes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.fazenda_permissoes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists fazenda_permissoes_insert_modulo on public.fazenda_permissoes;
create policy fazenda_permissoes_insert_modulo
  on public.fazenda_permissoes
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.fazenda_permissoes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.fazenda_permissoes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.fazenda_permissoes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists fazenda_permissoes_update_modulo on public.fazenda_permissoes;
create policy fazenda_permissoes_update_modulo
  on public.fazenda_permissoes
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.fazenda_permissoes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.fazenda_permissoes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.fazenda_permissoes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.fazenda_permissoes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.fazenda_permissoes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.fazenda_permissoes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists fazenda_permissoes_delete_modulo on public.fazenda_permissoes;
create policy fazenda_permissoes_delete_modulo
  on public.fazenda_permissoes
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.fazenda_permissoes.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.fazenda_permissoes.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.fazenda_permissoes.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_editar = true
      )
    )
  );


-- convites_acesso => módulo ajustes
alter table public.convites_acesso enable row level security;

drop policy if exists convites_acesso_select_modulo on public.convites_acesso;
create policy convites_acesso_select_modulo
  on public.convites_acesso
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.convites_acesso.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.convites_acesso.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.convites_acesso.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists convites_acesso_insert_modulo on public.convites_acesso;
create policy convites_acesso_insert_modulo
  on public.convites_acesso
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.convites_acesso.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.convites_acesso.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.convites_acesso.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists convites_acesso_update_modulo on public.convites_acesso;
create policy convites_acesso_update_modulo
  on public.convites_acesso
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.convites_acesso.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.convites_acesso.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.convites_acesso.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.convites_acesso.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.convites_acesso.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.convites_acesso.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists convites_acesso_delete_modulo on public.convites_acesso;
create policy convites_acesso_delete_modulo
  on public.convites_acesso
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.convites_acesso.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.convites_acesso.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.convites_acesso.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_editar = true
      )
    )
  );


-- audit_log => módulo ajustes
alter table public.audit_log enable row level security;

drop policy if exists audit_log_select_modulo on public.audit_log;
create policy audit_log_select_modulo
  on public.audit_log
  for select
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.audit_log.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.audit_log.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.audit_log.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_ver = true
      )
    )
  );

drop policy if exists audit_log_insert_modulo on public.audit_log;
create policy audit_log_insert_modulo
  on public.audit_log
  for insert
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.audit_log.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.audit_log.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.audit_log.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists audit_log_update_modulo on public.audit_log;
create policy audit_log_update_modulo
  on public.audit_log
  for update
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.audit_log.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.audit_log.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.audit_log.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_editar = true
      )
    )
  )
  with check (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.audit_log.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.audit_log.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.audit_log.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_editar = true
      )
    )
  );

drop policy if exists audit_log_delete_modulo on public.audit_log;
create policy audit_log_delete_modulo
  on public.audit_log
  for delete
  using (
    exists (
      select 1
      from public.fazendas f
      where f.id = public.audit_log.fazenda_id
        and f.owner_user_id = auth.uid()
    )
    or (
      exists (
        select 1
        from public.fazenda_acessos fa
        where fa.fazenda_id = public.audit_log.fazenda_id
          and fa.user_id = auth.uid()
          and upper(coalesce(fa.status, '')) = 'ATIVO'
      )
      and exists (
        select 1
        from public.fazenda_permissoes fp
        where fp.fazenda_id = public.audit_log.fazenda_id
          and fp.user_id = auth.uid()
          and fp.modulo = 'ajustes'
          and fp.pode_editar = true
      )
    )
  );
