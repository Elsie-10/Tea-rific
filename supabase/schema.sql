-- ============================================================
-- Tea-Terrific Bakery — Supabase Schema
-- Paste this entire file into Supabase > SQL Editor > Run
-- ============================================================

-- ── Enable UUID extension ──────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── USERS ─────────────────────────────────────────────────
create table if not exists users (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  email      text not null unique,
  password   text not null,
  role       text not null default 'customer' check (role in ('customer', 'owner')),
  phone      text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── PRODUCTS ──────────────────────────────────────────────
create table if not exists products (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  price       numeric(10,2) not null check (price >= 0),
  description text not null,
  image       text default '/images/placeholder.jpg',
  category    text not null check (category in ('Cake','Loaf','Cupcake','Cookie','Special','Drink','Other')),
  available   boolean default true,
  featured    boolean default false,
  options     text[] default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── ORDERS ────────────────────────────────────────────────
create table if not exists orders (
  id                    uuid primary key default uuid_generate_v4(),
  customer_name         text not null,
  phone                 text not null,
  location              text not null,
  total                 numeric(10,2) not null check (total >= 0),
  payment_status        text not null default 'Pending' check (payment_status in ('Pending','Paid','Failed')),
  order_status          text not null default 'Pending' check (order_status in ('Pending','Preparing','Ready','Completed','Cancelled')),
  mpesa_receipt_number  text,
  mpesa_transaction_id  text,
  checkout_request_id   text,
  user_id               uuid references users(id) on delete set null,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ── ORDER ITEMS ───────────────────────────────────────────
create table if not exists order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references orders(id) on delete cascade,
  product_id  uuid references products(id) on delete set null,
  name        text not null,
  price       numeric(10,2) not null,
  quantity    int not null check (quantity >= 1),
  image       text,
  created_at  timestamptz default now()
);

-- ── INDEXES ───────────────────────────────────────────────
create index if not exists idx_orders_status     on orders(order_status);
create index if not exists idx_orders_payment    on orders(payment_status);
create index if not exists idx_orders_created    on orders(created_at desc);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_products_category on products(category);
create index if not exists idx_orders_checkout   on orders(checkout_request_id);

-- ── AUTO-UPDATE updated_at ─────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger set_users_updated_at
  before update on users
  for each row execute function update_updated_at();

create or replace trigger set_products_updated_at
  before update on products
  for each row execute function update_updated_at();

create or replace trigger set_orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

-- ── ROW LEVEL SECURITY ────────────────────────────────────
alter table products   enable row level security;
alter table orders     enable row level security;
alter table order_items enable row level security;
alter table users      enable row level security;

create policy "Public can read available products"
  on products for select
  using (available = true);

 create extension if not exists "uuid-ossp";

create table if not exists comments (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid,
  user_name  text not null,
  body       text not null,
  created_at timestamptz default now()
);

create index if not exists idx_comments_created on comments(created_at desc);

-- Allow anyone to read comments
alter table comments enable row level security;

create policy "Public read comments"
  on comments for select
  using (true);

create policy "Service role insert comments"
  on comments for insert
  with check (true);

alter table order_items add column if not exists custom_note text;
-- ============================================================
-- Done. Run the seed script next: node scripts/seed.js
-- ============================================================
