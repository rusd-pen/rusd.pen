-- RUSD.PEN Database Migration
-- Target: Supabase (PostgreSQL)
-- Created At: 2026-07-18

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. TAXONOMY TABLE (Semesters, Courses, Material Types)
create table if not exists public.taxonomy (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    type text not null check (type in ('semester', 'course', 'type')),
    created_at timestamptz default now()
);

-- 2. ARTICLES TABLE (Journal / Essays)
create table if not exists public.articles (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text not null unique,
    content text not null,
    excerpt text,
    category text not null default 'General',
    status text not null default 'published' check (status in ('draft', 'published')),
    published_at timestamptz default now(),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 3. MATERIALS TABLE (Lecture summaries, notes, PDFs)
create table if not exists public.materials (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    file_url text not null,
    file_size text,
    file_type text default 'pdf',
    semester_id uuid references public.taxonomy(id) on delete set null,
    course_id uuid references public.taxonomy(id) on delete set null,
    type_id uuid references public.taxonomy(id) on delete set null,
    download_count integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 4. COMMENTS TABLE
create table if not exists public.comments (
    id uuid primary key default gen_random_uuid(),
    article_id uuid references public.articles(id) on delete cascade,
    author_name text not null,
    author_email text not null,
    content text not null,
    status text not null default 'pending' check (status in ('pending', 'approved', 'spam')),
    created_at timestamptz default now()
);

-- 5. REQUESTS TABLE (Contact / Lecture requests)
create table if not exists public.requests (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null,
    subject text,
    message text not null,
    status text not null default 'pending' check (status in ('pending', 'completed', 'archived')),
    created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.taxonomy enable row level security;
alter table public.articles enable row level security;
alter table public.materials enable row level security;
alter table public.comments enable row level security;
alter table public.requests enable row level security;

-- 5. CLEANUP: Drop existing policies first to make script fully idempotent
drop policy if exists "Allow public read-only access to taxonomy" on public.taxonomy;
drop policy if exists "Allow public read-only access to published articles" on public.articles;
drop policy if exists "Allow public read-only access to materials" on public.materials;
drop policy if exists "Allow public read-only access to approved comments" on public.comments;
drop policy if exists "Allow public to create comments" on public.comments;
drop policy if exists "Allow public to create requests" on public.requests;
drop policy if exists "Allow full access to taxonomy for authenticated admins" on public.taxonomy;
drop policy if exists "Allow full access to articles for authenticated admins" on public.articles;
drop policy if exists "Allow full access to materials for authenticated admins" on public.materials;
drop policy if exists "Allow full access to comments for authenticated admins" on public.comments;
drop policy if exists "Allow full access to requests for authenticated admins" on public.requests;

-- RLS Policies: Public Read access to Taxonomy, Articles, Materials, Comments (if approved)
create policy "Allow public read-only access to taxonomy" on public.taxonomy
    for select using (true);

create policy "Allow public read-only access to published articles" on public.articles
    for select using (status = 'published');

create policy "Allow public read-only access to materials" on public.materials
    for select using (true);

create policy "Allow public read-only access to approved comments" on public.comments
    for select using (status = 'approved');

-- Allow public to create comments
create policy "Allow public to create comments" on public.comments
    for insert with check (true);

-- Allow public to create requests
create policy "Allow public to create requests" on public.requests
    for insert with check (true);

-- Admin Admin access policies (requires auth.uid() or similar, standard check is authenticated)
create policy "Allow full access to taxonomy for authenticated admins" on public.taxonomy
    using (auth.role() = 'authenticated');

create policy "Allow full access to articles for authenticated admins" on public.articles
    using (auth.role() = 'authenticated');

create policy "Allow full access to materials for authenticated admins" on public.materials
    using (auth.role() = 'authenticated');

create policy "Allow full access to comments for authenticated admins" on public.comments
    using (auth.role() = 'authenticated');

create policy "Allow full access to requests for authenticated admins" on public.requests
    using (auth.role() = 'authenticated');

-- Indexes for search optimization
create index if not exists articles_slug_idx on public.articles(slug);
create index if not exists articles_status_idx on public.articles(status);
create index if not exists materials_semester_idx on public.materials(semester_id);
create index if not exists materials_course_idx on public.materials(course_id);
create index if not exists taxonomy_type_idx on public.taxonomy(type);

-- Insert seed taxonomy data
insert into public.taxonomy (name, slug, type) values
    ('Semester 1', 'semester-1', 'semester'),
    ('Semester 2', 'semester-2', 'semester'),
    ('Semester 3', 'semester-3', 'semester'),
    ('Semester 4', 'semester-4', 'semester'),
    ('Fiqh Islam', 'fiqh-islam', 'course'),
    ('Ushul Fiqh', 'ushul-fiqh', 'course'),
    ('Tafsir Ayat', 'tafsir-ayat', 'course'),
    ('Hadith Ahkam', 'hadith-ahkam', 'course'),
    ('Dictation / Imla', 'dictation', 'type'),
    ('Question Bank / Ikhtibar', 'question-bank', 'type'),
    ('Summary / Talkhis', 'summary', 'type')
on conflict do nothing;
