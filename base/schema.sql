-- Table des événements anonymes de CAA.app
-- À coller dans Supabase : SQL Editor > New query > Run

create table if not exists public.evenements (
  id       bigint generated always as identity primary key,
  recu_le  timestamptz not null default now(),
  type     text not null,          -- test_avc, risque, tension
  jour     date not null,
  heure    smallint not null,      -- 0 à 23
  pays     text not null,          -- SN
  donnees  jsonb not null default '{}'::jsonb
);

-- Sécurité : l'appli peut seulement AJOUTER des lignes. Elle ne peut ni lire, ni modifier, ni supprimer.
alter table public.evenements enable row level security;

drop policy if exists "ajout_depuis_appli" on public.evenements;
create policy "ajout_depuis_appli" on public.evenements
  for insert to anon
  with check (type ~ '^[a-z_]{1,40}$');   -- tout nom de module simple, sans avoir à modifier la base à chaque ajout

grant insert on public.evenements to anon;
