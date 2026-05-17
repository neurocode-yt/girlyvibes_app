-- Add secret/private diary note tables without resetting existing data.
create table if not exists public.private_diary_notes (
  id text not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date_key text not null,
  title text,
  text_content text,
  rich_content jsonb default '[]'::jsonb,
  color text,
  created_at_ms bigint,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone,
  primary key (id, user_id)
);

create index if not exists private_diary_notes_user_id_idx on public.private_diary_notes(user_id);
create index if not exists private_diary_notes_date_key_idx on public.private_diary_notes(date_key);
create index if not exists private_diary_notes_updated_at_idx on public.private_diary_notes(updated_at);

alter table public.private_diary_notes enable row level security;

grant select, insert, update, delete on public.private_diary_notes to authenticated;

drop policy if exists "Users can manage their own private diary notes" on public.private_diary_notes;
create policy "Users can manage their own private diary notes"
on public.private_diary_notes
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop trigger if exists set_private_diary_notes_updated_at on public.private_diary_notes;
create trigger set_private_diary_notes_updated_at
before update on public.private_diary_notes
for each row execute procedure public.set_updated_at();

create table if not exists public.private_diary_note_media (
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
    references public.private_diary_notes(id, user_id)
    on delete cascade
);

create index if not exists private_diary_note_media_user_id_idx on public.private_diary_note_media(user_id);
create index if not exists private_diary_note_media_note_id_idx on public.private_diary_note_media(note_id);
create index if not exists private_diary_note_media_storage_path_idx on public.private_diary_note_media(storage_path);

alter table public.private_diary_note_media enable row level security;

grant select, insert, update, delete on public.private_diary_note_media to authenticated;

drop policy if exists "Users can manage their own private diary note media" on public.private_diary_note_media;
create policy "Users can manage their own private diary note media"
on public.private_diary_note_media
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop trigger if exists set_private_diary_note_media_updated_at on public.private_diary_note_media;
create trigger set_private_diary_note_media_updated_at
before update on public.private_diary_note_media
for each row execute procedure public.set_updated_at();

-- Force PostgREST/Supabase API schema cache to see the new tables immediately.
notify pgrst, 'reload schema';
