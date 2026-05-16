-- =========================================================
-- GIRLYVIBES CLEAN RESET + FULL BACKEND SCHEMA
-- WARNING: This deletes previous GirlyVibes app tables/data.
-- =========================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- =========================================================
-- 0. DROP OLD POLICIES, TRIGGERS, FUNCTIONS, TABLES
-- =========================================================

-- Drop auth trigger/function safely
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Drop updated_at trigger function later recreated
drop function if exists public.set_updated_at();

-- Drop storage policies
drop policy if exists "Users can upload own avatars" on storage.objects;
drop policy if exists "Users can read own avatars" on storage.objects;
drop policy if exists "Users can update own avatars" on storage.objects;
drop policy if exists "Users can delete own avatars" on storage.objects;

drop policy if exists "Users can upload own vision board" on storage.objects;
drop policy if exists "Users can read own vision board" on storage.objects;
drop policy if exists "Users can update own vision board" on storage.objects;
drop policy if exists "Users can delete own vision board" on storage.objects;

drop policy if exists "Users can upload own note media" on storage.objects;
drop policy if exists "Users can read own note media" on storage.objects;
drop policy if exists "Users can update own note media" on storage.objects;
drop policy if exists "Users can delete own note media" on storage.objects;

-- Drop app tables in correct dependency order
drop table if exists public.notification_recipients cascade;
drop table if exists public.notifications cascade;
drop table if exists public.push_tokens cascade;
drop table if exists public.feedback cascade;
drop table if exists public.app_settings cascade;
drop table if exists public.activities cascade;
drop table if exists public.custom_routines cascade;
drop table if exists public.diary_note_media cascade;
drop table if exists public.diary_entries cascade;
drop table if exists public.diary_notes cascade;
drop table if exists public.profiles cascade;


-- =========================================================
-- 1. UPDATED_AT HELPER FUNCTION
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;


-- =========================================================
-- 2. PROFILES TABLE
-- Linked to Supabase Auth users
-- =========================================================

create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,

  name text,
  avatar_url text,

  language text default 'ar' check (language in ('ar', 'en')),

  streak integer default 0 not null,
  last_streak_date text,
  total_routines_completed integer default 0 not null,

  favorite_routine_id text,

  vision_board_image_url text,
  vision_board_mode text default 'square'
    check (vision_board_mode in ('square', 'horizontal', 'vertical')),

  favorite_advice text[] default '{}'::text[],

  glow_up_progress jsonb default '{}'::jsonb,
  detox_challenge jsonb default '{}'::jsonb,
  routine_progress jsonb default '{}'::jsonb,
  completed_routines jsonb default '{}'::jsonb,

  last_routine_reset_date text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();


-- =========================================================
-- 3. AUTO CREATE PROFILE WHEN AUTH USER IS CREATED
-- Works for anonymous users too. Email can be null.
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'username')
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();


-- =========================================================
-- 4. DIARY NOTES TABLE
-- Stores note text + rich editor JSON blocks
-- Actual images/audio go into Supabase Storage + diary_note_media
-- =========================================================

create table public.diary_notes (
  id text not null,
  user_id uuid references public.profiles(id) on delete cascade not null,

  date_key text not null, -- YYYY-MM-DD
  title text,
  text_content text,
  rich_content jsonb default '[]'::jsonb,
  color text,

  created_at_ms bigint, -- useful because your app currently uses JS timestamp
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone,

  primary key (id, user_id)
);

create index diary_notes_user_id_idx on public.diary_notes(user_id);
create index diary_notes_date_key_idx on public.diary_notes(date_key);
create index diary_notes_updated_at_idx on public.diary_notes(updated_at);

alter table public.diary_notes enable row level security;

create policy "Users can manage their own diary notes"
on public.diary_notes
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create trigger set_diary_notes_updated_at
before update on public.diary_notes
for each row execute procedure public.set_updated_at();


-- =========================================================
-- 5. DIARY NOTE MEDIA TABLE
-- Stores metadata for images and voice notes
-- =========================================================

create table public.diary_note_media (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  note_id text not null,

  media_type text not null check (media_type in ('image', 'audio')),
  bucket text not null default 'note_media',
  storage_path text not null,

  file_name text,
  mime_type text,
  file_size bigint,

  -- audio only
  duration_millis integer,

  -- image only
  width integer,
  height integer,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone,

  foreign key (note_id, user_id)
    references public.diary_notes(id, user_id)
    on delete cascade
);

create index diary_note_media_user_id_idx on public.diary_note_media(user_id);
create index diary_note_media_note_id_idx on public.diary_note_media(note_id);
create index diary_note_media_storage_path_idx on public.diary_note_media(storage_path);

alter table public.diary_note_media enable row level security;

create policy "Users can manage their own diary note media"
on public.diary_note_media
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create trigger set_diary_note_media_updated_at
before update on public.diary_note_media
for each row execute procedure public.set_updated_at();


-- =========================================================
-- 6. DIARY ENTRIES TABLE
-- Stores mood card for each day
-- =========================================================

create table public.diary_entries (
  id text not null, -- date key YYYY-MM-DD
  user_id uuid references public.profiles(id) on delete cascade not null,

  mood text,
  mood_emoji text,
  note text,
  card_color text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone,

  primary key (id, user_id)
);

create index diary_entries_user_id_idx on public.diary_entries(user_id);
create index diary_entries_updated_at_idx on public.diary_entries(updated_at);

alter table public.diary_entries enable row level security;

create policy "Users can manage their own diary entries"
on public.diary_entries
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create trigger set_diary_entries_updated_at
before update on public.diary_entries
for each row execute procedure public.set_updated_at();


-- =========================================================
-- 7. CUSTOM ROUTINES TABLE
-- User-created routines
-- =========================================================

create table public.custom_routines (
  id text not null,
  user_id uuid references public.profiles(id) on delete cascade not null,

  title text not null,
  title_en text,
  subtitle text,
  subtitle_en text,

  icon text,
  color text,
  time text,
  steps jsonb default '[]'::jsonb,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone,

  primary key (id, user_id)
);

create index custom_routines_user_id_idx on public.custom_routines(user_id);
create index custom_routines_updated_at_idx on public.custom_routines(updated_at);

alter table public.custom_routines enable row level security;

create policy "Users can manage their own custom routines"
on public.custom_routines
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create trigger set_custom_routines_updated_at
before update on public.custom_routines
for each row execute procedure public.set_updated_at();


-- =========================================================
-- 8. ACTIVITIES TABLE
-- Public app content editable from Supabase Dashboard
-- =========================================================

create table public.activities (
  id text primary key,

  title text not null,
  title_en text not null,

  duration text,
  duration_en text,

  image_key text,
  sort_order integer default 0,
  is_active boolean default true not null,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index activities_active_sort_idx on public.activities(is_active, sort_order);

alter table public.activities enable row level security;

-- Mobile app can read active activities
create policy "Anyone can read active activities"
on public.activities
for select
to anon, authenticated
using (is_active = true);

create trigger set_activities_updated_at
before update on public.activities
for each row execute procedure public.set_updated_at();


-- =========================================================
-- 9. PUSH TOKENS TABLE
-- For Firebase Cloud Messaging tokens
-- =========================================================

create table public.push_tokens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,

  token text not null,
  platform text default 'android',
  device_id text,
  app_version text,
  language text default 'ar' check (language in ('ar', 'en')),

  is_active boolean default true not null,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  unique (user_id, token)
);

create index push_tokens_user_id_idx on public.push_tokens(user_id);
create index push_tokens_token_idx on public.push_tokens(token);
create index push_tokens_active_idx on public.push_tokens(is_active);

alter table public.push_tokens enable row level security;

create policy "Users can manage their own push tokens"
on public.push_tokens
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create trigger set_push_tokens_updated_at
before update on public.push_tokens
for each row execute procedure public.set_updated_at();


-- =========================================================
-- 10. NOTIFICATIONS TABLE
-- Admin creates notifications here
-- Send function can read from here
-- =========================================================

create table public.notifications (
  id uuid default gen_random_uuid() primary key,

  title text not null,
  body text not null,
  data jsonb default '{}'::jsonb,

  target_type text default 'all'
    check (target_type in ('all', 'language', 'user')),
  target_language text check (target_language in ('ar', 'en')),
  target_user_id uuid references public.profiles(id) on delete set null,

  status text default 'draft'
    check (status in ('draft', 'scheduled', 'sending', 'sent', 'failed')),

  scheduled_at timestamp with time zone,
  sent_at timestamp with time zone,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index notifications_status_idx on public.notifications(status);
create index notifications_target_type_idx on public.notifications(target_type);

alter table public.notifications enable row level security;

-- No public insert/update/delete policies.
-- Admin should manage this from Supabase Dashboard or Edge Function/service role.

create trigger set_notifications_updated_at
before update on public.notifications
for each row execute procedure public.set_updated_at();


-- =========================================================
-- 11. NOTIFICATION RECIPIENTS TABLE
-- Log which users/tokens received notifications
-- =========================================================

create table public.notification_recipients (
  id uuid default gen_random_uuid() primary key,

  notification_id uuid references public.notifications(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade,
  push_token_id uuid references public.push_tokens(id) on delete set null,

  status text default 'pending'
    check (status in ('pending', 'sent', 'failed')),
  error_message text,

  sent_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index notification_recipients_notification_idx
on public.notification_recipients(notification_id);

create index notification_recipients_user_idx
on public.notification_recipients(user_id);

alter table public.notification_recipients enable row level security;

-- Users can only read their own notification delivery logs
create policy "Users can read their own notification logs"
on public.notification_recipients
for select
to authenticated
using (auth.uid() = user_id);


-- =========================================================
-- 12. FEEDBACK TABLE
-- For user feedback/report issue form later
-- =========================================================

create table public.feedback (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,

  type text default 'general'
    check (type in ('general', 'bug', 'suggestion', 'report')),
  message text not null,

  app_version text,
  device_info jsonb default '{}'::jsonb,

  status text default 'new'
    check (status in ('new', 'reviewed', 'closed')),

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index feedback_user_id_idx on public.feedback(user_id);
create index feedback_status_idx on public.feedback(status);

alter table public.feedback enable row level security;

create policy "Users can create their own feedback"
on public.feedback
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can read their own feedback"
on public.feedback
for select
to authenticated
using (auth.uid() = user_id);

create trigger set_feedback_updated_at
before update on public.feedback
for each row execute procedure public.set_updated_at();


-- =========================================================
-- 13. APP SETTINGS TABLE
-- Public settings/config that app can read
-- =========================================================

create table public.app_settings (
  key text primary key,
  value jsonb not null,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.app_settings enable row level security;

create policy "Anyone can read app settings"
on public.app_settings
for select
to anon, authenticated
using (true);

create trigger set_app_settings_updated_at
before update on public.app_settings
for each row execute procedure public.set_updated_at();


-- =========================================================
-- 14. CREATE STORAGE BUCKETS
-- Private buckets. Users access only their own folder.
-- =========================================================

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', false),
  ('vision_board', 'vision_board', false),
  ('note_media', 'note_media', false)
on conflict (id) do update set public = excluded.public;


-- =========================================================
-- 15. STORAGE POLICIES
-- File path must start with user id:
-- {user_id}/filename.ext
-- {user_id}/notes/{note_id}/filename.ext
-- =========================================================

-- AVATARS
create policy "Users can upload own avatars"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can read own avatars"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update own avatars"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own avatars"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);


-- VISION BOARD
create policy "Users can upload own vision board"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'vision_board'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can read own vision board"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'vision_board'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update own vision board"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'vision_board'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'vision_board'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own vision board"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'vision_board'
  and (storage.foldername(name))[1] = auth.uid()::text
);


-- NOTE MEDIA: images/audio inside diary notes
create policy "Users can upload own note media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'note_media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can read own note media"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'note_media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

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

create policy "Users can delete own note media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'note_media'
  and (storage.foldername(name))[1] = auth.uid()::text
);


-- =========================================================
-- 16. INSERT DEFAULT ACTIVITIES
-- Matches mobile-friendly fields:
-- title, title_en, duration, duration_en, image_key
-- =========================================================

insert into public.activities
(id, title, title_en, image_key, duration, duration_en, sort_order, is_active)
values
('a1',  'رتّبي غرفتك من جديد', 'Rearrange your room', 'room', '١-٢ ساعة', '1-2 hrs', 1, true),
('a2',  'ابدئي لوحة أحلامك', 'Start a vision board', 'creativity', '١ ساعة', '1 hr', 2, true),
('a3',  'اكتبي رسالة لنفسك المستقبلية', 'Write a letter to your future self', 'writing', '٣٠ دقيقة', '30 min', 3, true),
('a4',  'تعلّمي تسريحة شعر جديدة', 'Learn a new hairstyle from a tutorial', 'beauty', '٤٥ دقيقة', '45 min', 4, true),
('a5',  'تمشّي طويلاً والتقطي صوراً', 'Go for a long walk and take photos', 'nature', '١ ساعة', '1 hr', 5, true),
('a6',  'جرّبي وصفة طبخ جديدة', 'Cook or bake something new', 'cooking', '١ ساعة', '1 hr', 6, true),
('a7',  'اقرئي كتاباً لمدة ٣٠ دقيقة', 'Read a book for 30 minutes', 'reading', '٣٠ دقيقة', '30 min', 7, true),
('a8',  'نظّمي خزانة ملابسك', 'Reorganize and clean your wardrobe', 'room', '٢ ساعة', '2 hrs', 8, true),
('a9',  'تعلّمي ١٠ كلمات بلغة جديدة', 'Learn 10 words in a new language', 'reading', '٣٠ دقيقة', '30 min', 9, true),
('a10', 'جلسة يوغا ٢٠ دقيقة', 'Do a 20-minute yoga session', 'fitness', '٢٠ دقيقة', '20 min', 10, true),
('a11', 'ابدئي يومياتك أو bullet journal', 'Start a journal or bullet journal', 'writing', '٤٥ دقيقة', '45 min', 11, true),
('a12', 'صنّفي قوائم تشغيل لكل مزاج', 'Make a playlist for every mood', 'music', '١ ساعة', '1 hr', 12, true),
('a13', 'ارسمي أو خطّطي بحرية', 'Draw or sketch something', 'creativity', '١ ساعة', '1 hr', 13, true),
('a14', 'شاهدي وثائقياً ممتعاً', 'Watch a documentary', 'reading', '١ ساعة', '1 hr', 14, true),
('a15', 'اكتبي قائمة أحلامك الـ١٠٠', 'Write your top 100 dreams list', 'writing', '١ ساعة', '1 hr', 15, true),
('a16', 'تعلّمي لعبة ورق جديدة', 'Learn a new card game', 'games', '٣٠ دقيقة', '30 min', 16, true),
('a17', 'جرّبي ماسك جديد للبشرة', 'Try a new skincare face mask', 'beauty', '٣٠ دقيقة', '30 min', 17, true),
('a18', 'اكتبي شعراً أو قصة قصيرة', 'Write poetry or short stories', 'writing', '١ ساعة', '1 hr', 18, true),
('a19', 'نظّفي مكتبك بعمق', 'Deep clean your desk or workspace', 'room', '٤٥ دقيقة', '45 min', 19, true),
('a20', 'تصلي أو زوري أحد أجدادك', 'Call or visit a grandparent', 'nature', '٣٠ دقيقة', '30 min', 20, true),
('a21', 'تعلّمي فن الأوريغامي', 'Learn origami with paper', 'creativity', '٤٥ دقيقة', '45 min', 21, true),
('a22', 'احلّي أحجية (١٠٠+ قطعة)', 'Do a puzzle (100+ pieces)', 'games', '٢ ساعة', '2 hrs', 22, true),
('a23', 'جهّزي وجبات خفيفة صحية', 'Meal prep healthy snacks', 'cooking', '١ ساعة', '1 hr', 23, true),
('a24', 'صنّعي قائمة موسيقى للدراسة', 'Create a study-with-me playlist', 'music', '٣٠ دقيقة', '30 min', 24, true),
('a25', 'دهان أظافرك بتصميم مميز', 'Paint your nails with a fun design', 'beauty', '٤٥ دقيقة', '45 min', 25, true),
('a26', 'تعلّمي التأمل (٥ دقائق)', 'Learn to meditate (5 min)', 'fitness', '١٥ دقيقة', '15 min', 26, true),
('a27', 'رتّبي صورك القديمة في ألبوم', 'Sort through old photos and create an album', 'reading', '١ ساعة', '1 hr', 27, true),
('a28', 'اكتبي قيمك الشخصية', 'Write down your personal values', 'writing', '٣٠ دقيقة', '30 min', 28, true),
('a29', 'جرّبي حرفة جديدة (كروشيه، خط)', 'Try a new craft (crochet, knitting, calligraphy)', 'creativity', '٢ ساعة', '2 hrs', 29, true),
('a30', 'ابحثي عن مكان تودّين زيارته', 'Research a place you want to visit', 'nature', '٤٥ دقيقة', '45 min', 30, true)
on conflict (id) do update set
  title = excluded.title,
  title_en = excluded.title_en,
  image_key = excluded.image_key,
  duration = excluded.duration,
  duration_en = excluded.duration_en,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;


-- =========================================================
-- 17. DEFAULT APP SETTINGS
-- =========================================================

insert into public.app_settings (key, value)
values
('minimum_supported_version', '{"android": "1.0.0"}'::jsonb),
('maintenance_mode', '{"enabled": false, "message": ""}'::jsonb),
('features', '{"cloud_notes": true, "voice_notes": true, "note_images": true, "notifications": true}'::jsonb)
on conflict (key) do update set value = excluded.value;


-- =========================================================
-- DONE
-- =========================================================
