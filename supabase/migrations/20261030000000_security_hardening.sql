-- ============================================
-- VIGAM 2026 — security hardening
-- Run once in the Supabase SQL editor (or `supabase db push`).
--
-- After this migration:
--   * anon can no longer read or update the students table directly
--   * registration and check-in go through the functions below
--   * staff sign in with Supabase Auth and are authorised by the staff table
-- ============================================

-- --------------------------------------------
-- Students table (created only if missing, e.g. on a fresh project).
-- Import the HOD's verified ERP list into it afterwards.
-- --------------------------------------------
create table if not exists students (
  id uuid default gen_random_uuid() primary key,
  erp_id text unique not null,
  name text not null,
  branch text not null,             -- IT, Cyber, DS, MCA
  phone text,
  email text,
  year integer not null,
  role text not null default 'junior',
  photo_url text,
  qr_code_url text,
  superlative text,
  registered_at timestamptz,
  is_registered boolean default false,
  is_present boolean default false,
  registered_rank integer,
  wants_to_volunteer boolean default false,
  checked_in_at timestamptz
);

-- --------------------------------------------
-- Columns
-- --------------------------------------------
alter table students add column if not exists qr_token uuid unique;
alter table students add column if not exists email_sent_at timestamptz;
alter table students add column if not exists is_at_dinner boolean not null default false;
alter table students add column if not exists dinner_checked_at timestamptz;

-- Give every already-registered student an unguessable pass token.
-- Old passes (VIGAM2026|ERP|NAME) stop working at the gate.
update students set qr_token = gen_random_uuid()
where is_registered and qr_token is null;

-- --------------------------------------------
-- Staff
-- role: admin (dashboard + both scanners), gate, dinner
-- Add staff with:
--   insert into staff (user_id, role)
--   select id, 'gate' from auth.users where email = 'gate1@example.com';
-- --------------------------------------------
create table if not exists staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'gate', 'dinner'))
);
alter table staff enable row level security;
-- No policies: only the security-definer functions below read it.

create or replace function staff_role()
returns text
language sql stable security definer
set search_path = public
as $$
  select role from staff where user_id = auth.uid()
$$;

-- --------------------------------------------
-- Students RLS
-- --------------------------------------------
alter table students enable row level security;
drop policy if exists "Allow public read" on students;
drop policy if exists "Allow public update" on students;
drop policy if exists "Admins read students" on students;
create policy "Admins read students" on students
  for select to authenticated using (staff_role() = 'admin');
-- No insert/update/delete policies: all writes go through the functions below.

-- --------------------------------------------
-- Helpers
-- --------------------------------------------
create or replace function student_role(p_branch text, p_year int)
returns text
language sql immutable
as $$
  select case
    when p_branch = 'MCA' then case when p_year >= 2 then 'senior' else 'junior' end
    else case when p_year >= 4 then 'senior' else 'junior' end
  end
$$;

-- Registration has no deadline or on/off switch (removed on purpose).
drop function if exists registration_is_open();

-- --------------------------------------------
-- Public: aggregate counts for splash + scanner counters
-- --------------------------------------------
create or replace function event_counts()
returns json
language sql stable security definer
set search_path = public
as $$
  select json_build_object(
    'registered', count(*) filter (where is_registered),
    'present',    count(*) filter (where is_present),
    'at_dinner',  count(*) filter (where is_at_dinner)
  )
  from students
$$;

-- --------------------------------------------
-- Public: look up a student during registration.
-- Returns only what the "is this you?" screen needs — no phone/email.
-- --------------------------------------------
create or replace function lookup_student(p_erp_id text)
returns table (erp_id text, name text, branch text, year int, role text, is_registered boolean)
language sql stable security definer
set search_path = public
as $$
  select s.erp_id, s.name, s.branch, s.year,
         student_role(s.branch, s.year), s.is_registered
  from students s
  where s.erp_id = upper(trim(p_erp_id))
$$;

-- --------------------------------------------
-- Public: register a student.
-- Atomic: ranks are assigned under a lock and a student can only register once.
-- p_photo_path is the object name in the photos bucket (e.g. 6605029_<uuid>.jpg);
-- it is stored in photo_url and turned into a public URL by the client.
-- --------------------------------------------
drop function if exists register_student(text, text, text, text, boolean);
create function register_student(
  p_erp_id text,
  p_phone text,
  p_superlative text default null,
  p_photo_path text default null,
  p_wants_to_volunteer boolean default false
)
returns table (qr_token uuid, registered_rank int, role text, email text)
language plpgsql security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  s students%rowtype;
  v_role text;
  v_rank int;
begin
  if coalesce(p_phone, '') !~ '^\+91[0-9]{10}$' then
    raise exception 'invalid_phone';
  end if;

  -- Serialise registrations so ranks are unique.
  perform pg_advisory_xact_lock(hashtext('vigam2026_register'));

  select * into s from students where students.erp_id = upper(trim(p_erp_id)) for update;
  if not found then
    raise exception 'not_found';
  end if;
  if s.is_registered then
    raise exception 'already_registered';
  end if;

  v_role := student_role(s.branch, s.year);

  -- Only accept a photo this student actually uploaded to our photos bucket
  -- (never an arbitrary URL, which admins' browsers would then load).
  if p_photo_path is not null and not (
       left(p_photo_path, length(s.erp_id) + 1) = s.erp_id || '_'
       and substr(p_photo_path, length(s.erp_id) + 2) ~ '^[0-9a-f-]{36}\.jpg$'
       and exists (select 1 from storage.objects o where o.bucket_id = 'photos' and o.name = p_photo_path)
     ) then
    raise exception 'invalid_photo';
  end if;

  select coalesce(max(students.registered_rank), 0) + 1 into v_rank
  from students where students.is_registered;

  update students set
    phone = p_phone,
    email = coalesce(students.email, lower(s.erp_id) || '@rungta.org'),
    role = v_role,
    superlative = case when v_role = 'senior' then left(p_superlative, 120) end,
    photo_url = case when v_role = 'senior' then p_photo_path end,
    wants_to_volunteer = case when v_role = 'junior' then coalesce(p_wants_to_volunteer, false) else false end,
    is_registered = true,
    registered_at = now(),
    registered_rank = v_rank,
    qr_token = gen_random_uuid()
  where students.id = s.id
  returning students.qr_token, students.registered_rank, students.role, students.email
  into qr_token, registered_rank, role, email;

  return next;
end;
$$;

-- --------------------------------------------
-- Staff: gate check-in. Pass either the QR token or an ERP ID (manual entry).
-- --------------------------------------------
create or replace function gate_check_in(p_token uuid default null, p_erp_id text default null)
returns json
language plpgsql security definer
set search_path = public
as $$
declare
  s students%rowtype;
begin
  if coalesce(staff_role(), '') not in ('admin', 'gate') then
    raise exception 'forbidden';
  end if;

  select * into s from students
  where (p_token is not null and qr_token = p_token)
     or (p_token is null and erp_id = upper(trim(p_erp_id)));

  if not found then
    return json_build_object('status', 'invalid');
  end if;
  if not s.is_registered then
    return json_build_object('status', 'not_registered', 'name', s.name);
  end if;

  -- Atomic: only one scanner can flip is_present.
  update students set is_present = true, checked_in_at = now()
  where id = s.id and not is_present;

  return json_build_object(
    'status', case when found then 'success' else 'duplicate' end,
    'name', s.name, 'branch', s.branch, 'role', s.role, 'superlative', s.superlative
  );
end;
$$;

-- --------------------------------------------
-- Staff: dinner check-in. Requires a gate check-in first.
-- --------------------------------------------
create or replace function dinner_check_in(p_token uuid default null, p_erp_id text default null)
returns json
language plpgsql security definer
set search_path = public
as $$
declare
  s students%rowtype;
begin
  if coalesce(staff_role(), '') not in ('admin', 'dinner') then
    raise exception 'forbidden';
  end if;

  select * into s from students
  where (p_token is not null and qr_token = p_token)
     or (p_token is null and erp_id = upper(trim(p_erp_id)));

  if not found then
    return json_build_object('status', 'invalid');
  end if;
  if not s.is_registered then
    return json_build_object('status', 'not_registered', 'name', s.name);
  end if;
  if not s.is_present then
    return json_build_object('status', 'not_at_gate', 'name', s.name);
  end if;

  update students set is_at_dinner = true, dinner_checked_at = now()
  where id = s.id and not is_at_dinner;

  return json_build_object(
    'status', case when found then 'success' else 'duplicate' end,
    'name', s.name, 'branch', s.branch, 'role', s.role
  );
end;
$$;

-- --------------------------------------------
-- Grants
-- --------------------------------------------
revoke all on function staff_role() from public, anon, authenticated;
revoke all on function student_role(text, int) from public, anon, authenticated;
revoke all on function event_counts() from public, anon, authenticated;
revoke all on function lookup_student(text) from public, anon, authenticated;
revoke all on function register_student(text, text, text, text, boolean) from public, anon, authenticated;
revoke all on function gate_check_in(uuid, text) from public, anon, authenticated;
revoke all on function dinner_check_in(uuid, text) from public, anon, authenticated;

grant execute on function staff_role() to authenticated;
grant execute on function event_counts() to anon, authenticated;
grant execute on function lookup_student(text) to anon, authenticated;
grant execute on function register_student(text, text, text, text, boolean) to anon, authenticated;
grant execute on function gate_check_in(uuid, text) to authenticated;
grant execute on function dinner_check_in(uuid, text) to authenticated;

-- --------------------------------------------
-- Storage
-- photos: during registration a real, not-yet-registered student may upload
--   <erp_id>_<uuid>.jpg (JPEG, max 2MB). Nobody may overwrite, list or delete.
-- qrcodes: written only by the email function using the service-role key.
-- Review Storage → Policies afterwards and remove any older, broader policies.
-- --------------------------------------------
create or replace function can_upload_photo(p_name text)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select p_name ~ '^[A-Za-z0-9]+_[0-9a-f-]{36}\.jpg$'
     and exists (
       select 1 from students
       where erp_id = split_part(p_name, '_', 1) and not is_registered
     )
$$;
revoke all on function can_upload_photo(text) from public, anon, authenticated;
grant execute on function can_upload_photo(text) to anon, authenticated;

drop policy if exists "Anyone can upload photos" on storage.objects;
create policy "Anyone can upload photos" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'photos' and can_upload_photo(name));

-- Create the buckets if missing (public = files readable by URL, not listable)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('photos',  'photos',  true, 2097152, array['image/jpeg']),
  ('qrcodes', 'qrcodes', true, 524288,  array['image/png'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
