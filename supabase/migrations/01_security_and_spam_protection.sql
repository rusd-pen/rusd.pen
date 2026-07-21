-- =======================================================
-- RUSD.PEN Security & Spam Protection Migration
-- Target: Supabase (PostgreSQL)
-- =======================================================

-- 1. CLEANUP: Drop existing vulnerable/generic and custom policies (makes script idempotent)
drop policy if exists "Allow public to create comments" on public.comments;
drop policy if exists "Allow public to create requests" on public.requests;
drop policy if exists "Allow full access to taxonomy for authenticated admins" on public.taxonomy;
drop policy if exists "Allow full access to articles for authenticated admins" on public.articles;
drop policy if exists "Allow full access to materials for authenticated admins" on public.materials;
drop policy if exists "Allow full access to comments for authenticated admins" on public.comments;
drop policy if exists "Allow full access to requests for authenticated admins" on public.requests;

-- Drop newly created policies if they already exist from previous runs
drop policy if exists "Allow full access to taxonomy for admins" on public.taxonomy;
drop policy if exists "Allow full access to articles for admins" on public.articles;
drop policy if exists "Allow full access to materials for admins" on public.materials;
drop policy if exists "Allow public to create pending comments" on public.comments;
drop policy if exists "Allow full access to comments for admins" on public.comments;
drop policy if exists "Allow public to create pending requests" on public.requests;
drop policy if exists "Allow full access to requests for admins" on public.requests;

-- 2. HELPER: Function to safely extract Client IP from Supabase request headers
create or replace function public.get_client_ip()
returns text as $$
declare
  headers json;
  ip_address text;
begin
  -- Get request headers from PostgREST environment
  headers := coalesce(current_setting('request.headers', true)::json, '{}'::json);
  
  -- Extract x-forwarded-for (which contains client IP)
  ip_address := headers->>'x-forwarded-for';
  
  -- If x-forwarded-for has multiple IPs (e.g. proxies), take the first one
  if ip_address is not null and position(',' in ip_address) > 0 then
    ip_address := split_part(ip_address, ',', 1);
  end if;
  
  return coalesce(trim(ip_address), '127.0.0.1');
end;
$$ language plpgsql security definer;

-- 3. SCHEMA UPDATES: Add client_ip columns for tracking and blocking
alter table public.comments 
  add column if not exists client_ip text default public.get_client_ip();

alter table public.requests 
  add column if not exists client_ip text default public.get_client_ip();

-- 4. ANTI-SPAM: Database-level Rate Limiting Trigger
-- This prevents headless scripts from spamming comments or contact requests.
create or replace function public.check_rate_limit()
returns trigger as $$
declare
  active_ip text;
  one_min_count integer;
  one_hour_count integer;
  max_per_minute constant integer := 3;   -- Max 3 submissions per minute
  max_per_hour constant integer := 15;    -- Max 15 submissions per hour
begin
  -- Retrieve client IP
  active_ip := public.get_client_ip();
  
  -- 1-Minute Check
  if tg_table_name = 'comments' then
    select count(*) into one_min_count 
    from public.comments 
    where client_ip = active_ip and created_at > now() - interval '1 minute';
    
    select count(*) into one_hour_count 
    from public.comments 
    where client_ip = active_ip and created_at > now() - interval '1 hour';
  elsif tg_table_name = 'requests' then
    select count(*) into one_min_count 
    from public.requests 
    where client_ip = active_ip and created_at > now() - interval '1 minute';
    
    select count(*) into one_hour_count 
    from public.requests 
    where client_ip = active_ip and created_at > now() - interval '1 hour';
  end if;

  -- Enforce Limits
  if one_min_count >= max_per_minute then
    raise exception 'Batas kirim terlampaui. Harap tunggu 1 menit sebelum mencoba lagi. (Too many requests)';
  end if;

  if one_hour_count >= max_per_hour then
    raise exception 'Anda telah mengirim terlalu banyak data hari ini. Silakan coba lagi nanti. (Hourly limit exceeded)';
  end if;

  -- Auto-populate client IP during insert
  new.client_ip := active_ip;
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing triggers before creating them to avoid "already exists" errors
drop trigger if exists trigger_comments_rate_limit on public.comments;
drop trigger if exists trigger_requests_rate_limit on public.requests;

-- Apply Rate Limiting triggers
create trigger trigger_comments_rate_limit
  before insert on public.comments
  for each row execute function public.check_rate_limit();

create trigger trigger_requests_rate_limit
  before insert on public.requests
  for each row execute function public.check_rate_limit();

-- 5. CONTENT VALIDATION: Basic trigger to block obvious spam words & invalid lengths
create or replace function public.validate_content()
returns trigger as $$
begin
  -- Trim whitespaces
  new.content := trim(coalesce(new.content, ''));
  
  -- Length Check (min 5 chars, max 1500)
  if length(new.content) < 5 then
    raise exception 'Komentar terlalu pendek! Minimal 5 karakter.';
  end if;
  
  if length(new.content) > 1500 then
    raise exception 'Komentar terlalu panjang! Maksimal 1500 karakter.';
  end if;

  -- Block specific spam keywords / HTML injection attempts
  if new.content ~* '(<script|href=|\[url=|crypto-|viagra|slot gacor|casino|click here)' then
    raise exception 'Komentar Anda terdeteksi sebagai spam atau mengandung konten terlarang.';
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Drop existing validator trigger before creating it
drop trigger if exists trigger_comments_validate on public.comments;

-- Apply validator trigger
create trigger trigger_comments_validate
  before insert on public.comments
  for each row execute function public.validate_content();

-- 6. SECURE ADMIN CHECKS (Dynamic Admin Validation)
-- Checks if the authenticated user's email matches 'nizarar42@gmail.com' (the owner).
-- You can add more emails to this list.
create or replace function public.is_admin()
returns boolean as $$
begin
  return (
    auth.role() = 'authenticated' AND 
    (auth.jwt() ->> 'email') = 'nizarar42@gmail.com'
  );
end;
$$ language plpgsql security definer;

-- 7. RE-APPLY SECURE RLS POLICIES

-- Taxonomy RLS
create policy "Allow full access to taxonomy for admins" on public.taxonomy
    for all using (public.is_admin());

-- Articles RLS
create policy "Allow full access to articles for admins" on public.articles
    for all using (public.is_admin());

-- Materials RLS
create policy "Allow full access to materials for admins" on public.materials
    for all using (public.is_admin());

-- Comments RLS
-- Force public to ONLY insert comments with status = 'pending'. They CANNOT self-approve!
create policy "Allow public to create pending comments" on public.comments
    for insert with check (status = 'pending');

create policy "Allow full access to comments for admins" on public.comments
    for all using (public.is_admin());

-- Requests RLS
-- Force public to ONLY insert requests with status = 'pending'.
create policy "Allow public to create pending requests" on public.requests
    for insert with check (status = 'pending');

create policy "Allow full access to requests for admins" on public.requests
    for all using (public.is_admin());
