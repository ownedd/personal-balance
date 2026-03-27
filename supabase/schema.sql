-- ============================================
-- Personal Balance - Supabase Schema
-- ============================================
-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase
-- (https://supabase.com/dashboard → SQL Editor)

-- 1. Tabla de perfiles (se llena automáticamente al registrarse)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Trigger: crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Tabla de cuentas
create table if not exists public.accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text not null check (type in ('bank', 'cash', 'savings', 'credit_card', 'crypto_wallet')),
  currency text default 'USD' not null,
  current_balance numeric(15, 2) default 0 not null,
  color text default '#c9a84c' not null,
  icon text default 'wallet' not null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null
);

alter table public.accounts enable row level security;

create policy "Users can view own accounts"
  on public.accounts for select
  using (auth.uid() = user_id);

create policy "Users can create own accounts"
  on public.accounts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own accounts"
  on public.accounts for update
  using (auth.uid() = user_id);

create policy "Users can delete own accounts"
  on public.accounts for delete
  using (auth.uid() = user_id);

-- 3. Tabla de activos por cuenta cripto
create table if not exists public.account_assets (
  id uuid default gen_random_uuid() primary key,
  account_id uuid references public.accounts on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  asset_symbol text not null,
  asset_name text not null,
  coingecko_id text not null,
  quantity numeric(24, 8) default 0 not null,
  average_buy_price numeric(15, 2),
  reference_currency text default 'USD' not null,
  created_at timestamptz default now() not null,
  unique (account_id, asset_symbol)
);

alter table public.account_assets enable row level security;

create policy "Users can view own account assets"
  on public.account_assets for select
  using (auth.uid() = user_id);

create policy "Users can create own account assets"
  on public.account_assets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own account assets"
  on public.account_assets for update
  using (auth.uid() = user_id);

create policy "Users can delete own account assets"
  on public.account_assets for delete
  using (auth.uid() = user_id);

create index idx_account_assets_account on public.account_assets (account_id);
create index idx_account_assets_user on public.account_assets (user_id);

-- 4. Tabla de transacciones
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  account_id uuid references public.accounts on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  type text not null check (type in ('income', 'expense', 'adjustment')),
  amount numeric(15, 2) not null,
  balance_after numeric(15, 2) not null,
  description text not null,
  category text,
  transaction_date date default current_date not null,
  created_at timestamptz default now() not null
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can create own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

create index idx_transactions_account on public.transactions (account_id);
create index idx_transactions_date on public.transactions (transaction_date);
create index idx_transactions_user_date on public.transactions (user_id, transaction_date);

-- 5. Tabla de snapshots mensuales
create table if not exists public.monthly_snapshots (
  id uuid default gen_random_uuid() primary key,
  account_id uuid references public.accounts on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  year integer not null,
  month integer not null check (month between 1 and 12),
  opening_balance numeric(15, 2) not null,
  closing_balance numeric(15, 2) not null,
  total_income numeric(15, 2) default 0 not null,
  total_expenses numeric(15, 2) default 0 not null,
  closed_at timestamptz,
  unique (account_id, year, month)
);

alter table public.monthly_snapshots enable row level security;

create policy "Users can view own snapshots"
  on public.monthly_snapshots for select
  using (auth.uid() = user_id);

create policy "Users can create own snapshots"
  on public.monthly_snapshots for insert
  with check (auth.uid() = user_id);

create policy "Users can update own snapshots"
  on public.monthly_snapshots for update
  using (auth.uid() = user_id);

create index idx_snapshots_user_period on public.monthly_snapshots (user_id, year, month);
