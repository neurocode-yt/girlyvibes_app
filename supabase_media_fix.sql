-- Run this in Supabase SQL Editor if note images/media are not appearing in the database.
-- Safe to run multiple times. This does not drop user data.
--
-- Expected flow:
-- 1. Image/audio files are uploaded to the private Supabase Storage bucket: note_media.
-- 2. Database rows are written to public.diary_note_media with bucket + storage_path.
-- 3. public.diary_notes.rich_content stores the matching imageStoragePath/audioStoragePath.

create extension if not exists pgcrypto;

create table if not exists public.diary_note_media (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  note_id text not null,
  media_type text not null check (media_type in ('image', 'audio')),
  bucket text not null default 'note_media',
  storage_path text not null,
  file_name text,
  mime_type text,
  file_size bigint,
  duration_millis integer,
  width integer,
  height integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone,
  foreign key (note_id, user_id)
    references public.diary_notes(id, user_id)
    on delete cascade
);

create index if not exists diary_note_media_user_id_idx on public.diary_note_media(user_id);
create index if not exists diary_note_media_note_id_idx on public.diary_note_media(note_id);
create index if not exists diary_note_media_storage_path_idx on public.diary_note_media(storage_path);

alter table public.diary_notes enable row level security;
alter table public.diary_note_media enable row level security;

grant select, insert, update, delete on public.diary_notes to authenticated;
grant select, insert, update, delete on public.diary_note_media to authenticated;

drop policy if exists "Users can manage their own diary notes" on public.diary_notes;
create policy "Users can manage their own diary notes"
on public.diary_notes
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own diary note media" on public.diary_note_media;
create policy "Users can manage their own diary note media"
on public.diary_note_media
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', false),
  ('vision_board', 'vision_board', false),
  ('note_media', 'note_media', false)
on conflict (id) do update set public = excluded.public;

update storage.buckets
set
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
where id in ('avatars', 'vision_board');

update storage.buckets
set
  file_size_limit = 26214400,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'audio/mp4',
    'audio/mpeg',
    'audio/aac',
    'audio/wav',
    'audio/x-caf'
  ]
where id = 'note_media';

grant select on storage.buckets to authenticated;
grant select, insert, update, delete on storage.objects to authenticated;

drop policy if exists "Users can upload own note media" on storage.objects;
create policy "Users can upload own note media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'note_media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can read own note media" on storage.objects;
create policy "Users can read own note media"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'note_media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update own note media" on storage.objects;
create policy "Users can update own note media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'note_media'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'note_media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete own note media" on storage.objects;
create policy "Users can delete own note media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'note_media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Apply the same table grants for private diary media only if those tables exist.
do $$
begin
  if to_regclass('public.private_diary_notes') is not null then
    execute 'alter table public.private_diary_notes enable row level security';
    execute 'grant select, insert, update, delete on public.private_diary_notes to authenticated';
  end if;

  if to_regclass('public.private_diary_note_media') is not null then
    execute 'alter table public.private_diary_note_media enable row level security';
    execute 'grant select, insert, update, delete on public.private_diary_note_media to authenticated';
  end if;
end $$;

notify pgrst, 'reload schema';
