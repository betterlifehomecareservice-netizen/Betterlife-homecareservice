-- extensions
create extension if not exists "pgcrypto";

-- products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- banners table
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- triggers
drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists set_banners_updated_at on public.banners;
create trigger set_banners_updated_at
before update on public.banners
for each row
execute function public.set_updated_at();

-- enable rls
alter table public.products enable row level security;
alter table public.banners enable row level security;

-- remove old policies if re-run
drop policy if exists "public can read products" on public.products;
drop policy if exists "authenticated can insert products" on public.products;
drop policy if exists "authenticated can update products" on public.products;
drop policy if exists "authenticated can delete products" on public.products;

drop policy if exists "public can read banners" on public.banners;
drop policy if exists "authenticated can insert banners" on public.banners;
drop policy if exists "authenticated can update banners" on public.banners;
drop policy if exists "authenticated can delete banners" on public.banners;

-- products policies
create policy "public can read products"
on public.products
for select
to public
using (true);

create policy "authenticated can insert products"
on public.products
for insert
to authenticated
with check (true);

create policy "authenticated can update products"
on public.products
for update
to authenticated
using (true)
with check (true);

create policy "authenticated can delete products"
on public.products
for delete
to authenticated
using (true);

-- banners policies
create policy "public can read banners"
on public.banners
for select
to public
using (true);

create policy "authenticated can insert banners"
on public.banners
for insert
to authenticated
with check (true);

create policy "authenticated can update banners"
on public.banners
for update
to authenticated
using (true)
with check (true);

create policy "authenticated can delete banners"
on public.banners
for delete
to authenticated
using (true);
