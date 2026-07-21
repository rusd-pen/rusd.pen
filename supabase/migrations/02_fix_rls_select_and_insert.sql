-- =======================================================
-- RUSD.PEN RLS and Select/Insert Fix Migration
-- Run this in your Supabase SQL Editor to resolve RLS insert errors.
-- =======================================================

-- 1. Create client IP helper function if not exists
create or replace function public.get_client_ip()
returns text as $$
declare
  headers json;
  ip_address text;
begin
  headers := coalesce(current_setting('request.headers', true)::json, '{}'::json);
  ip_address := headers->>'x-forwarded-for';
  if ip_address is not null and position(',' in ip_address) > 0 then
    ip_address := split_part(ip_address, ',', 1);
  end if;
  return coalesce(trim(ip_address), '127.0.0.1');
end;
$$ language plpgsql security definer;

-- 2. Add client_ip columns if they do not exist
alter table public.comments add column if not exists client_ip text default public.get_client_ip();
alter table public.requests add column if not exists client_ip text default public.get_client_ip();

-- 3. Cleanup existing potentially conflicting policies
drop policy if exists "Allow public to create requests" on public.requests;
drop policy if exists "Allow public to create pending requests" on public.requests;
drop policy if exists "Allow public insert to requests" on public.requests;
drop policy if exists "Allow public to create comments" on public.comments;
drop policy if exists "Allow public to create pending comments" on public.comments;
drop policy if exists "Allow public to select own requests by IP" on public.requests;
drop policy if exists "Allow public to select own pending comments by IP" on public.comments;

-- 4. Enable RLS on both tables
alter table public.requests enable row level security;
alter table public.comments enable row level security;

-- 5. Create secure public INSERT policies
create policy "Allow public to create pending requests" on public.requests
    for insert with check (status = 'pending');

create policy "Allow public to create pending comments" on public.comments
    for insert with check (status = 'pending');

-- 6. Create public SELECT policies based on IP
-- This is critical! When the Supabase client inserts a row, it may trigger a SELECT/RETURNING.
-- If the visitor doesn't have SELECT permission on the row, Postgres throws an RLS violation error.
-- These policies securely allow a visitor to select/read ONLY the requests/comments they submitted from their IP.
create policy "Allow public to select own requests by IP" on public.requests
    for select using (client_ip = public.get_client_ip());

create policy "Allow public to select own pending comments by IP" on public.comments
    for select using (status = 'approved' or client_ip = public.get_client_ip());
