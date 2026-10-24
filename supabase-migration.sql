-- =========================================================================
-- CF (CLASS FOCUS) — SUPABASE DATABASE SCHEMA MIGRATION & RLS POLICIES
-- =========================================================================

-- 1. EXTENSIONS & SETUP
create extension if not exists "uuid-ossp";

-- 2. PRODUCTS TABLE
create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  category_label text not null,
  price_kz numeric(10,2) not null default 7000,
  client_shirt_price_kz numeric(10,2) default 4000,
  description text,
  story text,
  details text[],
  available_sizes text[] default array['S', 'M', 'L', 'XL', 'XXL'],
  stock_status jsonb default '{"S": 5, "M": 10, "L": 15, "XL": 8, "XXL": 4}'::jsonb,
  image text,
  badge text,
  is_hero boolean default false,
  status text default 'published',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PRODUCT IMAGES TABLE (Supabase Storage references)
create table if not exists public.product_images (
  id uuid default uuid_generate_v4() primary key,
  product_id text references public.products(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  display_order integer default 0,
  alt_text text
);

-- 4. REVIEWS TABLE
create table if not exists public.reviews (
  id text primary key,
  author_name text not null,
  rating integer check (rating between 1 and 5) not null,
  category text not null default 'Geral',
  comment text not null,
  date date not null default current_date,
  status text not null default 'pending',
  verified_purchase boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ORDERS TABLE (Custom orders, delivery codes & independent statuses)
create table if not exists public.orders (
  id text primary key,
  order_number text unique not null,
  client_name text not null,
  phone text not null,
  service_type text not null default 'cf-brand',
  model text not null,
  color text not null default 'black',
  size text not null default 'L',
  quantity integer not null default 1,
  unit_price_kz numeric(10,2) not null,
  total_price_kz numeric(10,2) not null,
  phrase text,
  font_style text,
  font_color text,
  placement text,
  graphic_data_url text,
  notes text,
  date date not null default current_date,
  status text not null default 'novo',
  
  -- Delivery Confirmation Code System (Secure & Single-use)
  delivery_code text, -- only returned upon creation
  delivery_code_hash text not null,
  delivery_code_consumed boolean default false,
  delivery_confirmed_at timestamp with time zone,
  delivery_courier_id text,
  delivery_attempts integer default 0,

  -- Independent Statuses (Section 6)
  order_status text not null default 'recebido',
  payment_status text not null default 'por_confirmar',
  delivery_status text not null default 'pendente',

  -- Financial & Fulfillment tracking
  fulfillment_status text default 'pendente',
  financial_status text default 'por_pagar',
  amount_received numeric(10,2) default 0,
  difference_reason text,
  financial_confirmed_date date,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. PAYMENTS TABLE
create table if not exists public.payments (
  id uuid default uuid_generate_v4() primary key,
  order_id text references public.orders(id) on delete cascade,
  amount_received numeric(10,2) not null,
  expected_amount numeric(10,2) not null,
  method text default 'whatsapp_transfer',
  status text not null default 'por_confirmar',
  difference_reason text,
  confirmed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. DELIVERY EVENTS TABLE (Audit trail for status changes)
create table if not exists public.delivery_events (
  id uuid default uuid_generate_v4() primary key,
  order_id text references public.orders(id) on delete cascade,
  previous_status text,
  new_status text not null,
  changed_by text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. PROFILES & ROLES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null default 'client', -- 'admin' | 'courier' | 'client'
  full_name text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. AUDIT LOGS TABLE
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.reviews enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.delivery_events enable row level security;
alter table public.profiles enable row level security;
alter table public.audit_logs enable row level security;

-- Public can read published products and approved reviews
create policy "Public read products" on public.products for select using (status = 'published');
create policy "Public read reviews" on public.reviews for select using (status = 'approved');
create policy "Clients submit reviews" on public.reviews for insert with check (status = 'pending');
create policy "Clients create orders" on public.orders for insert with check (true);
create policy "Public order lookup" on public.orders for select using (true);

-- Authenticated Admin / Courier policies
create policy "Admin full access products" on public.products for all using (
  auth.role() = 'authenticated' and exists (
    select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

create policy "Admin and Courier order access" on public.orders for all using (
  auth.role() = 'authenticated' and exists (
    select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('admin', 'courier')
  )
);

create policy "Admin financial access" on public.payments for all using (
  auth.role() = 'authenticated' and exists (
    select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- =========================================================================
-- STORAGE BUCKETS SETUP
-- =========================================================================
-- Run in Supabase Storage SQL or create via dashboard:
-- 1. Create a public bucket named 'cf-product-images'
-- 2. Create a private bucket named 'cf-secure-documents' (optional)
insert into storage.buckets (id, name, public) 
values ('cf-product-images', 'cf-product-images', true)
on conflict (id) do nothing;

create policy "Public Access Product Images" on storage.objects for select using ( bucket_id = 'cf-product-images' );
create policy "Admin Upload Product Images" on storage.objects for insert with check ( bucket_id = 'cf-product-images' );
