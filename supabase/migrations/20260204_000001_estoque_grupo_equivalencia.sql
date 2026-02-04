BEGIN;

-- 1.1) Tabela de catálogo de grupos (editável no futuro sem mexer no React)
create table if not exists public.estoque_grupos_equivalencia (
  codigo text primary key,                 -- ex: 'PROSTAGLANDINA'
  categoria text not null,                 -- ex: 'Farmácia', 'Cozinha', 'Higiene e Limpeza', 'Reprodução'
  label text not null,                     -- ex: 'Prostaglandina (PGF2α)'
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_estoque_grupos_cat on public.estoque_grupos_equivalencia (categoria);

-- 1.2) Coluna nova nas 3 tabelas (produto/lote/movimento)
alter table public.estoque_produtos
  add column if not exists grupo_equivalencia text;

alter table public.estoque_lotes
  add column if not exists grupo_equivalencia text;

alter table public.estoque_movimentos
  add column if not exists grupo_equivalencia text;

-- 1.3) FK opcional (somente se quiser travar pra não entrar lixo)
-- (Deixa “deferrable” e não obriga a existir, pois produto pode ser sem grupo.)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fk_produtos_grupo_equivalencia'
  ) then
    alter table public.estoque_produtos
      add constraint fk_produtos_grupo_equivalencia
      foreign key (grupo_equivalencia)
      references public.estoque_grupos_equivalencia (codigo)
      deferrable initially deferred;
  end if;
end $$;

-- Lotes e movimentos: FK também (opcional, mas ajuda)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'fk_lotes_grupo_equivalencia') then
    alter table public.estoque_lotes
      add constraint fk_lotes_grupo_equivalencia
      foreign key (grupo_equivalencia)
      references public.estoque_grupos_equivalencia (codigo)
      deferrable initially deferred;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'fk_mov_grupo_equivalencia') then
    alter table public.estoque_movimentos
      add constraint fk_mov_grupo_equivalencia
      foreign key (grupo_equivalencia)
      references public.estoque_grupos_equivalencia (codigo)
      deferrable initially deferred;
  end if;
end $$;

-- 1.4) Trigger: manter lote/movimento SEMPRE sincronizados com o produto
create or replace function public.fn_estoque_sync_grupo_equivalencia()
returns trigger
language plpgsql
as $$
declare v_grupo text;
begin
  -- se veio grupo explícito, respeita; senão, copia do produto
  if new.grupo_equivalencia is not null and new.grupo_equivalencia <> '' then
    return new;
  end if;

  if new.produto_id is null then
    return new;
  end if;

  select p.grupo_equivalencia into v_grupo
  from public.estoque_produtos p
  where p.id = new.produto_id;

  new.grupo_equivalencia := v_grupo;
  return new;
end $$;

drop trigger if exists trg_lotes_sync_grupo_equivalencia on public.estoque_lotes;
create trigger trg_lotes_sync_grupo_equivalencia
before insert or update of produto_id, grupo_equivalencia
on public.estoque_lotes
for each row
execute function public.fn_estoque_sync_grupo_equivalencia();

drop trigger if exists trg_mov_sync_grupo_equivalencia on public.estoque_movimentos;
create trigger trg_mov_sync_grupo_equivalencia
before insert or update of produto_id, grupo_equivalencia
on public.estoque_movimentos
for each row
execute function public.fn_estoque_sync_grupo_equivalencia();

-- 1.5) Backfill: copiar grupo já cadastrado em produtos para lotes/movimentos existentes
update public.estoque_lotes l
set grupo_equivalencia = p.grupo_equivalencia
from public.estoque_produtos p
where l.produto_id = p.id
  and (l.grupo_equivalencia is null or l.grupo_equivalencia = '');

update public.estoque_movimentos m
set grupo_equivalencia = p.grupo_equivalencia
from public.estoque_produtos p
where m.produto_id = p.id
  and (m.grupo_equivalencia is null or m.grupo_equivalencia = '');

-- 1.6) Seed com os grupos principais (você pode editar/ativar/desativar depois no banco)
-- FARMÁCIA — antibióticos por classe
insert into public.estoque_grupos_equivalencia (codigo, categoria, label) values
  ('ANTIBIOTICO_PENICILINAS', 'Farmácia', 'Antibiótico — Penicilinas (β-lactâmicos)'),
  ('ANTIBIOTICO_CEFALOSPORINAS', 'Farmácia', 'Antibiótico — Cefalosporinas (β-lactâmicos)'),
  ('ANTIBIOTICO_TETRACICLINAS', 'Farmácia', 'Antibiótico — Tetraciclinas (ex: oxitetraciclina)'),
  ('ANTIBIOTICO_MACROLIDEOS', 'Farmácia', 'Antibiótico — Macrolídeos (ex: tilosina/tulatromicina)'),
  ('ANTIBIOTICO_AMINOGLICOSIDEOS', 'Farmácia', 'Antibiótico — Aminoglicosídeos (ex: gentamicina/neomicina)'),
  ('ANTIBIOTICO_SULFONAMIDAS_TMP', 'Farmácia', 'Antibiótico — Sulfas + Trimetoprim'),
  ('ANTIBIOTICO_FLUOROQUINOLONAS', 'Farmácia', 'Antibiótico — Fluoroquinolonas (ex: enrofloxacina)'),
  ('ANTIBIOTICO_FENICOIS', 'Farmácia', 'Antibiótico — Fenicóis (ex: florfenicol)'),
  ('ANTIBIOTICO_LINCOSAMIDAS', 'Farmácia', 'Antibiótico — Lincosamidas (ex: lincomicina)'),
  ('ANTIBIOTICO_POLIMIXINAS', 'Farmácia', 'Antibiótico — Polimixinas (ex: polimixina B)')
  on conflict (codigo) do nothing;

-- FARMÁCIA — anti-inflamatórios (AINE e corticoides)
insert into public.estoque_grupos_equivalencia (codigo, categoria, label) values
  ('AINE_FLUNIXINA', 'Farmácia', 'Anti-inflamatório (AINE) — Flunixina'),
  ('AINE_MELOXICAM', 'Farmácia', 'Anti-inflamatório (AINE) — Meloxicam'),
  ('AINE_KETOPROFENO', 'Farmácia', 'Anti-inflamatório (AINE) — Cetoprofeno'),
  ('AINE_TOLFENAMICO', 'Farmácia', 'Anti-inflamatório (AINE) — Ácido tolfenâmico'),
  ('AINE_CARPROFENO', 'Farmácia', 'Anti-inflamatório (AINE) — Carprofeno'),
  ('CORTICOIDE_DEXAMETASONA', 'Farmácia', 'Corticoide — Dexametasona'),
  ('CORTICOIDE_PREDNISOLONA', 'Farmácia', 'Corticoide — Prednisolona/Prednisona'),
  ('CORTICOIDE_HIDROCORTISONA', 'Farmácia', 'Corticoide — Hidrocortisona')
  on conflict (codigo) do nothing;

-- FARMÁCIA — hormônios (por “função”, não por marca)
insert into public.estoque_grupos_equivalencia (codigo, categoria, label) values
  ('HORMONIO_PROGESTERONA', 'Farmácia', 'Hormônio — Progesterona (P4 / dispositivos)'),
  ('HORMONIO_PROSTAGLANDINA', 'Farmácia', 'Hormônio — Prostaglandina (PGF2α / análogos)'),
  ('HORMONIO_GNRH', 'Farmácia', 'Hormônio — GnRH (análogos)'),
  ('HORMONIO_ECG', 'Farmácia', 'Hormônio — eCG (gonadotrofina coriônica equina)'),
  ('HORMONIO_HCG', 'Farmácia', 'Hormônio — hCG'),
  ('HORMONIO_FSH', 'Farmácia', 'Hormônio — FSH'),
  ('HORMONIO_ESTRADIOL', 'Farmácia', 'Hormônio — Estradiol (ésteres)'),
  ('HORMONIO_OXITOCINA', 'Farmácia', 'Hormônio — Ocitocina')
  on conflict (codigo) do nothing;

-- FARMÁCIA — outros “grupos úteis” (bem comuns)
insert into public.estoque_grupos_equivalencia (codigo, categoria, label) values
  ('ANTIPARASITARIO_ENDO', 'Farmácia', 'Antiparasitário — Endoparasiticida'),
  ('ANTIPARASITARIO_ECTO', 'Farmácia', 'Antiparasitário — Ectoparasiticida'),
  ('VITAMINAS_SUPLEMENTOS', 'Farmácia', 'Vitaminas / Suplementos injetáveis'),
  ('ANTISSEPTICO', 'Farmácia', 'Antisséptico / tópicos'),
  ('ANESTESICO_SEDATIVO', 'Farmácia', 'Anestésico / Sedativo'),
  ('ANTIMICROBIANO_INTRA_MAMARIO', 'Farmácia', 'Intra-mamário (mastite) — grupo funcional'),
  ('SOLUTION_FLUIDOTERAPIA', 'Farmácia', 'Soluções / fluidoterapia')
  on conflict (codigo) do nothing;

-- COZINHA — grupos funcionais (pra dieta e consumo automático)
insert into public.estoque_grupos_equivalencia (codigo, categoria, label) values
  ('COZINHA_RACAO_CONCENTRADO', 'Cozinha', 'Ração / Concentrado'),
  ('COZINHA_VOLUMOSO_SILAGEM', 'Cozinha', 'Volumoso / Silagem / Feno'),
  ('COZINHA_MINERAL', 'Cozinha', 'Mineral / Mistura mineral'),
  ('COZINHA_NUCLEO_PREMIX', 'Cozinha', 'Núcleo / Pré-mistura (premix)'),
  ('COZINHA_ADITIVO', 'Cozinha', 'Aditivo (geral)'),
  ('COZINHA_TAMPONANTE', 'Cozinha', 'Tamponante (ex: bicarbonato)'),
  ('COZINHA_PROBIOTICO', 'Cozinha', 'Probiótico'),
  ('COZINHA_PREBIOTICO', 'Cozinha', 'Prebiótico'),
  ('COZINHA_LEVEDURA', 'Cozinha', 'Levedura'),
  ('COZINHA_IONOFORO', 'Cozinha', 'Ionóforo (ex: monensina/lasalocida)'),
  ('COZINHA_ANTIFUNGICO_CONSERVANTE', 'Cozinha', 'Conservante / antifúngico'),
  ('COZINHA_ADS_MICOTOXINA', 'Cozinha', 'Adsorvente de micotoxina'),
  ('COZINHA_UREIA_NNP', 'Cozinha', 'Ureia / NNP'),
  ('COZINHA_SAIS', 'Cozinha', 'Sais (sal comum, calcário, etc.)'),
  ('COZINHA_FITOTERAPICO_HOMEOPATICO', 'Cozinha', 'Fitoterápico / Homeopático')
  on conflict (codigo) do nothing;

-- HIGIENE E LIMPEZA — classes úteis
insert into public.estoque_grupos_equivalencia (codigo, categoria, label) values
  ('HIGIENE_DETERGENTE_ALCALINO', 'Higiene e Limpeza', 'Detergente alcalino'),
  ('HIGIENE_DETERGENTE_ACIDO', 'Higiene e Limpeza', 'Detergente ácido'),
  ('HIGIENE_SANITIZANTE_CLORADO', 'Higiene e Limpeza', 'Sanitizante clorado (hipoclorito/derivados)'),
  ('HIGIENE_AMONIO_QUATERNARIO', 'Higiene e Limpeza', 'Amônio quaternário'),
  ('HIGIENE_PEROXIDO_PERACETICO', 'Higiene e Limpeza', 'Peróxido / Ácido peracético'),
  ('HIGIENE_IODOFORO', 'Higiene e Limpeza', 'Iodóforo'),
  ('HIGIENE_CLOREXIDINA', 'Higiene e Limpeza', 'Clorexidina'),
  ('HIGIENE_DEGRAxANTE', 'Higiene e Limpeza', 'Desengraxante'),
  ('HIGIENE_DIP_PRE_POS', 'Higiene e Limpeza', 'Pré/Pós-dip (grupo funcional)'),
  ('HIGIENE_DESINFETANTE_GERAL', 'Higiene e Limpeza', 'Desinfetante geral')
  on conflict (codigo) do nothing;

-- REPRODUÇÃO — simples (sem o “sexado/convencional” agora)
insert into public.estoque_grupos_equivalencia (codigo, categoria, label) values
  ('REPRO_SEMEN', 'Reprodução', 'Sêmen (doses)'),
  ('REPRO_EMBRIAO', 'Reprodução', 'Embrião'),
  ('REPRO_NITROGENIO', 'Reprodução', 'Nitrogênio líquido'),
  ('REPRO_MATERIAL_INSEMINACAO', 'Reprodução', 'Material de inseminação (bainhas/pipetas/etc.)'),
  ('REPRO_LUVAS_LUBRIFICANTE', 'Reprodução', 'Luvas / Lubrificantes'),
  ('REPRO_MATERIAL_COLETA', 'Reprodução', 'Material de coleta / manejo repro')
  on conflict (codigo) do nothing;

COMMIT;
