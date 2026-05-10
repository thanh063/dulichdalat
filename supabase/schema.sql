-- =========================================================
-- Dalat Travel Supabase schema
-- Copy-paste this whole script into the Supabase SQL editor.
-- It matches the current app flow:
-- - chat history uses session_id
-- - user_id is optional
-- - server-side admin client can write bookings/chat history
-- =========================================================

create extension if not exists pgcrypto;

-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text unique not null,
  phone text not null default '',
  address text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Chat history table
create table if not exists public.chat_history (
  id bigserial primary key,
  user_id uuid null references public.profiles(id) on delete set null,
  session_id text not null,
  message text not null,
  sender text not null check (sender in ('user', 'bot')),
  created_at timestamptz not null default now()
);

-- Bookings table
create table if not exists public.bookings (
  id bigserial primary key,
  user_id uuid null references public.profiles(id) on delete set null,
  place_name text not null,
  type text not null check (type in ('room', 'table')),
  customer_name text not null,
  phone text not null,
  date_in date not null,
  date_out date,
  time time,
  guests integer not null check (guests > 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

-- Admin notifications table
create table if not exists public.admin_notifications (
  id bigserial primary key,
  type text not null default 'new_booking',
  title text not null,
  message text not null,
  booking_id bigint references public.bookings(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Keep updated_at in sync for profiles
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- Create a profile row automatically after auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Khách'),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do update
    set name = excluded.name,
        email = excluded.email,
        phone = excluded.phone,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.chat_history enable row level security;
alter table public.bookings enable row level security;
alter table public.admin_notifications enable row level security;

-- Drop old policies if re-running the script
drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_update on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists chat_select_own on public.chat_history;
drop policy if exists chat_insert_session on public.chat_history;
drop policy if exists chat_delete_own on public.chat_history;
drop policy if exists bookings_insert on public.bookings;
drop policy if exists bookings_own on public.bookings;
drop policy if exists bookings_update_own on public.bookings;
drop policy if exists admin_notifications_select_admin on public.admin_notifications;
drop policy if exists admin_notifications_update_admin on public.admin_notifications;

-- Profiles policies
create policy profiles_select
on public.profiles
for select
using (auth.uid() = id or exists (
  select 1
  from public.profiles p
  where p.id = auth.uid()
    and p.role = 'admin'
));

create policy profiles_update
on public.profiles
for update
using (auth.uid() = id or exists (
  select 1
  from public.profiles p
  where p.id = auth.uid()
    and p.role = 'admin'
));

-- If you ever create profiles from client-side signup flows, keep this.
create policy profiles_insert_own
on public.profiles
for insert
with check (auth.uid() = id);

-- Chat history policies
-- The app currently writes chat history via server-side admin client, so RLS is mostly for future client-side auth.
create policy chat_select_own
on public.chat_history
for select
using (auth.uid() = user_id or user_id is null);

create policy chat_insert_session
on public.chat_history
for insert
with check (
  user_id is null
  or auth.uid() = user_id
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

create policy chat_delete_own
on public.chat_history
for delete
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- Bookings policies
create policy bookings_insert
on public.bookings
for insert
with check (
  user_id is null
  or auth.uid() = user_id
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

create policy bookings_own
on public.bookings
for select
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

create policy bookings_update_own
on public.bookings
for update
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- Admin notifications policies
create policy admin_notifications_select_admin
on public.admin_notifications
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

create policy admin_notifications_update_admin
on public.admin_notifications
for update
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- Helpful indexes for session-based chat lookup and foreign keys
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_chat_history_session_id on public.chat_history(session_id);
create index if not exists idx_chat_history_user_id on public.chat_history(user_id);
create index if not exists idx_bookings_user_id on public.bookings(user_id);
create index if not exists idx_admin_notifications_booking_id on public.admin_notifications(booking_id);
