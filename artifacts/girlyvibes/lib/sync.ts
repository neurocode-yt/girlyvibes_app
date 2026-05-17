import { supabase } from './supabase';
import { AppData, DiaryNote, DiaryEntry, RichBlock } from '@/contexts/AppContext';
import { RoutineTemplate } from '@/data/routines';
import { Alert } from 'react-native';

interface UploadedMedia {
  bucket: string;
  fileName: string;
  mimeType: string;
  publicUri: string;
  size: number;
  storagePath: string;
}

function extensionFromMimeType(mimeType?: string | null) {
  const normalized = mimeType?.toLowerCase();
  if (normalized === 'image/jpeg' || normalized === 'image/jpg') return 'jpg';
  if (normalized === 'image/png') return 'png';
  if (normalized === 'image/webp') return 'webp';
  if (normalized === 'image/heic') return 'heic';
  if (normalized === 'image/heif') return 'heif';
  if (normalized === 'audio/mp4' || normalized === 'audio/m4a') return 'm4a';
  if (normalized === 'audio/mpeg' || normalized === 'audio/mp3') return 'mp3';
  if (normalized === 'audio/aac') return 'aac';
  if (normalized === 'audio/wav') return 'wav';
  if (normalized === 'audio/x-caf') return 'caf';
  return null;
}

let lastMediaUploadAlertAt = 0;

function getMediaInfo(uri: string, bucket: string) {
  if (uri.startsWith('data:')) {
    const mimeType = uri.match(/^data:([^;]+);/)?.[1] || (bucket === 'note_media' ? 'image/jpeg' : 'image/png');
    const fileExt = extensionFromMimeType(mimeType) || (bucket === 'note_media' ? 'jpg' : 'png');
    return { fileExt, mimeType };
  }

  const cleanUri = uri.split('?')[0] ?? uri;
  const rawExt = cleanUri.includes('.') ? cleanUri.split('.').pop() : undefined;
  const fileExt = (rawExt || (bucket === 'note_media' ? 'jpg' : 'png')).toLowerCase();
  const isAudio = ['m4a', 'mp3', 'aac', 'wav', 'caf'].includes(fileExt);
  const mimeType = isAudio ? `audio/${fileExt === 'm4a' ? 'mp4' : fileExt}` : `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

  return { fileExt, mimeType };
}

function sanitizePathSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function isLocalMediaUri(uri: string | null | undefined) {
  return !!uri && (uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('data:'));
}

function isRemoteMediaUri(uri: string | null | undefined) {
  return !!uri && (uri.startsWith('http://') || uri.startsWith('https://'));
}

function base64ToUint8Array(base64: string) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const cleaned = base64.replace(/=+$/, '').replace(/\s/g, '');
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i += 4) {
    const chunk =
      (chars.indexOf(cleaned[i] ?? 'A') << 18) |
      (chars.indexOf(cleaned[i + 1] ?? 'A') << 12) |
      (chars.indexOf(cleaned[i + 2] ?? 'A') << 6) |
      chars.indexOf(cleaned[i + 3] ?? 'A');

    bytes.push((chunk >> 16) & 255);
    if (i + 2 < cleaned.length) bytes.push((chunk >> 8) & 255);
    if (i + 3 < cleaned.length) bytes.push(chunk & 255);
  }

  return new Uint8Array(bytes);
}

function getDataUriBase64(dataUri: string) {
  const match = dataUri.match(/^data:[^;]+;base64,(.+)$/);
  if (!match) throw new Error('Invalid data URI - cannot extract base64 content');
  return match[1];
}

function storageObjectUrl(bucket: string, storagePath: string) {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw new Error('EXPO_PUBLIC_SUPABASE_URL environment variable is not set');
  const encodedPath = storagePath.split('/').map((part) => encodeURIComponent(part)).join('/');
  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`;
}

async function getStorageAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey) throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable is not set');
  return {
    anonKey,
    token: session?.access_token ?? anonKey,
  };
}

function describeUploadError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message);
  }
  return String(error);
}

async function uploadBytesWithSupabaseJs(bucket: string, storagePath: string, bytes: Uint8Array, mimeType: string) {
  const { error } = await supabase.storage.from(bucket).upload(storagePath, bytes, {
    cacheControl: '3600',
    contentType: mimeType,
    upsert: true,
  });
  if (error) throw error;
}

async function uploadBytesWithXhr(bucket: string, storagePath: string, bytes: Uint8Array, mimeType: string) {
  const { anonKey, token } = await getStorageAuthHeaders();
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', storageObjectUrl(bucket, storagePath));
    xhr.timeout = 60000;
    xhr.setRequestHeader('apikey', anonKey);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Cache-Control', '3600');
    xhr.setRequestHeader('Content-Type', mimeType);
    xhr.setRequestHeader('x-upsert', 'true');
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      reject(new Error(`Supabase Storage ${xhr.status}: ${xhr.responseText || xhr.response || 'Upload rejected'}`));
    };
    xhr.onerror = () => reject(new Error('XHR network request failed while uploading media'));
    xhr.ontimeout = () => reject(new Error('XHR upload timed out while uploading media'));
    xhr.send(bytes as unknown as Document);
  });
}

async function uploadBytesWithRestFetch(bucket: string, storagePath: string, bytes: Uint8Array, mimeType: string) {
  const { anonKey, token } = await getStorageAuthHeaders();
  const response = await fetch(storageObjectUrl(bucket, storagePath), {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
      'Cache-Control': '3600',
      'Content-Type': mimeType,
      'x-upsert': 'true',
    },
    body: bytes as unknown as BodyInit,
  });
  if (!response.ok) {
    const body = await response.text().catch(() => `HTTP ${response.status}`);
    throw new Error(`Supabase Storage ${response.status}: ${body}`);
  }
}

async function uploadBytes(bucket: string, storagePath: string, bytes: Uint8Array, mimeType: string) {
  const failures: string[] = [];
  try {
    await uploadBytesWithSupabaseJs(bucket, storagePath, bytes, mimeType);
    return;
  } catch (error) {
    failures.push(`supabase-js: ${describeUploadError(error)}`);
  }

  try {
    await uploadBytesWithXhr(bucket, storagePath, bytes, mimeType);
    return;
  } catch (error) {
    failures.push(`xhr: ${describeUploadError(error)}`);
  }

  try {
    await uploadBytesWithRestFetch(bucket, storagePath, bytes, mimeType);
    return;
  } catch (error) {
    failures.push(`fetch: ${describeUploadError(error)}`);
  }

  throw new Error(`All image upload methods failed. ${failures.join(' | ')}`);
}

async function getSignedMediaUri(bucket: string, storagePath: string, fallbackUri?: string) {
  if (!storagePath || isLocalMediaUri(storagePath) || isRemoteMediaUri(storagePath)) {
    return fallbackUri ?? storagePath;
  }

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(storagePath, 60 * 60 * 24 * 7);
  if (error) {
    console.warn(`Failed to create signed URL for ${bucket}/${storagePath}`, error);
    return fallbackUri ?? storagePath;
  }

  return data.signedUrl;
}

export async function uploadMedia(
  userId: string,
  bucket: string,
  localUri: string,
  prefix: string,
): Promise<UploadedMedia | null> {
  if (!localUri) return null;

  try {
    if (!isLocalMediaUri(localUri)) {
      return null;
    }

    const { fileExt, mimeType } = getMediaInfo(localUri, bucket);
    const safePrefix = sanitizePathSegment(prefix);
    const fileName = `${safePrefix}_${Date.now()}.${fileExt}`;
    const storagePath = `${userId}/${fileName}`;
    if (!localUri.startsWith('data:')) {
      console.warn(`Skipping non-data media upload for ${bucket}. APK-safe upload requires picker base64 data.`);
      return null;
    }

    const body = base64ToUint8Array(getDataUriBase64(localUri));

    await uploadBytes(bucket, storagePath, body, mimeType);

    return {
      bucket,
      fileName,
      mimeType,
      publicUri: await getSignedMediaUri(bucket, storagePath, localUri),
      size: body.byteLength,
      storagePath,
    };
  } catch (error) {
    console.warn(`Failed to upload media to ${bucket}`, error);
    if (localUri.startsWith('data:') && Date.now() - lastMediaUploadAlertAt > 5000) {
      lastMediaUploadAlertAt = Date.now();
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert(
        'Image sync failed',
        `The app saved your changes, but this image could not upload to Supabase Storage.\n\nBucket: ${bucket}\n\n${message}`,
      );
    }
    return null;
  }
}

export async function syncProfileToCloud(userId: string, data: AppData): Promise<AppData | null> {
  try {
    const avatarUpload = data.profilePhoto && isLocalMediaUri(data.profilePhoto)
      ? await uploadMedia(userId, 'avatars', data.profilePhoto, 'avatar')
      : null;
    const visionBoardUpload = data.visionBoardImage && isLocalMediaUri(data.visionBoardImage)
      ? await uploadMedia(userId, 'vision_board', data.visionBoardImage, 'vision')
      : null;
    const profilePhotoStoragePath =
      avatarUpload?.storagePath ??
      data.profilePhotoStoragePath ??
      (!isRemoteMediaUri(data.profilePhoto) && !isLocalMediaUri(data.profilePhoto) ? data.profilePhoto : null);
    const visionBoardStoragePath =
      visionBoardUpload?.storagePath ??
      data.visionBoardStoragePath ??
      (!isRemoteMediaUri(data.visionBoardImage) && !isLocalMediaUri(data.visionBoardImage) ? data.visionBoardImage : null);
    const syncedData = {
      ...data,
      profilePhoto: avatarUpload?.publicUri ?? data.profilePhoto,
      profilePhotoStoragePath,
      visionBoardImage: visionBoardUpload?.publicUri ?? data.visionBoardImage,
      visionBoardStoragePath,
    };

    const baseProfilePayload = {
      name: syncedData.profileName,
      streak: syncedData.streak,
      last_streak_date: syncedData.lastStreakDate,
      total_routines_completed: syncedData.totalRoutinesCompleted,
      favorite_routine_id: syncedData.favoriteRoutineId,
      vision_board_image_url: syncedData.visionBoardStoragePath,
      vision_board_mode: syncedData.visionBoardMode,
      favorite_advice: syncedData.favoriteAdvice,
      glow_up_progress: syncedData.glowUpProgress,
      detox_challenge: syncedData.detoxChallenge,
      routine_progress: syncedData.routineProgress,
      completed_routines: syncedData.completedRoutines,
      last_routine_reset_date: syncedData.lastRoutineResetDate,
      avatar_url: syncedData.profilePhotoStoragePath,
    };
    const profilePayload = {
      ...baseProfilePayload,
      private_diary_pin: syncedData.secretDiaryPin,
      private_diary_enabled: syncedData.secretDiaryEnabled || !!syncedData.secretDiaryPin,
    };
    const needsPrivateDiaryColumns = !!syncedData.secretDiaryPin || !!syncedData.secretDiaryEnabled;

    let { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(profilePayload)
      .eq('id', userId)
      .select('id')
      .maybeSingle();

    if (isMissingProfileOptionalColumnError(updateError)) {
      console.warn('Private diary profile columns are missing. Retrying core profile sync without private PIN columns.');
      const retry = await supabase
        .from('profiles')
        .update(baseProfilePayload)
        .eq('id', userId)
        .select('id')
        .maybeSingle();
      updatedProfile = retry.data;
      updateError = retry.error;
      if (!updateError && needsPrivateDiaryColumns) {
        console.warn('Private diary PIN was saved locally, but not stored in Supabase because profiles.private_diary_pin/private_diary_enabled are missing. Run supabase_private_diary.sql.');
        return null;
      }
    }

    if (updateError) throw updateError;

    if (!updatedProfile) {
      let { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId, ...profilePayload });

      if (isMissingProfileOptionalColumnError(insertError)) {
        const retry = await supabase
          .from('profiles')
          .insert({ id: userId, ...baseProfilePayload });
        insertError = retry.error;
        if (!insertError && needsPrivateDiaryColumns) {
          console.warn('Private diary PIN was saved locally, but not stored in Supabase because profiles.private_diary_pin/private_diary_enabled are missing. Run supabase_private_diary.sql.');
          return null;
        }
      }

      if (insertError) throw insertError;
    }

    return syncedData;
  } catch (error) {
    console.warn('Failed to sync profile', error);
    return null;
  }
}

async function prepareRichContentMedia(userId: string, note: DiaryNote) {
  const updatedRichContent = (note.richContent ?? []).map(block => ({ ...block }));
  const mediaRows: Array<{
    bucket: string;
    duration_millis?: number | null;
    file_name: string;
    file_size?: number | null;
    media_type: 'image' | 'audio';
    mime_type: string;
    note_id: string;
    storage_path: string;
    user_id: string;
  }> = [];

  for (let i = 0; i < updatedRichContent.length; i++) {
    const block = updatedRichContent[i];

    if (block.type === 'image' && block.imageUri) {
      const existingPath = block.imageStoragePath;
      const upload = existingPath
        ? null
        : await uploadMedia(userId, 'note_media', block.imageUri, `note_img_${note.id}_${block.id}`);
      const storagePath = existingPath ?? upload?.storagePath;
      const bucket = upload?.bucket ?? block.mediaBucket ?? 'note_media';

      if (storagePath) {
        const signedUri = await getSignedMediaUri(bucket, storagePath, block.imageUri);
        block.imageUri = signedUri;
        block.imageStoragePath = storagePath;
        block.mediaBucket = bucket;
        block.mimeType = upload?.mimeType ?? block.mimeType ?? 'image/jpeg';
        mediaRows.push({
          bucket,
          file_name: upload?.fileName ?? storagePath.split('/').pop() ?? block.id,
          file_size: upload?.size ?? null,
          media_type: 'image',
          mime_type: block.mimeType,
          note_id: note.id,
          storage_path: storagePath,
          user_id: userId,
        });
      }
    }

    if (block.type === 'audio' && block.audioUri) {
      const existingPath = block.audioStoragePath;
      const upload = existingPath
        ? null
        : await uploadMedia(userId, 'note_media', block.audioUri, `note_aud_${note.id}_${block.id}`);
      const storagePath = existingPath ?? upload?.storagePath;
      const bucket = upload?.bucket ?? block.mediaBucket ?? 'note_media';

      if (storagePath) {
        const signedUri = await getSignedMediaUri(bucket, storagePath, block.audioUri);
        block.audioUri = signedUri;
        block.audioStoragePath = storagePath;
        block.mediaBucket = bucket;
        block.mimeType = upload?.mimeType ?? block.mimeType ?? 'audio/mp4';
        mediaRows.push({
          bucket,
          duration_millis: block.audioDurationMillis ?? null,
          file_name: upload?.fileName ?? storagePath.split('/').pop() ?? block.id,
          file_size: upload?.size ?? null,
          media_type: 'audio',
          mime_type: block.mimeType,
          note_id: note.id,
          storage_path: storagePath,
          user_id: userId,
        });
      }
    }
  }

  return { mediaRows, updatedRichContent };
}

async function hydrateRichContentMedia(blocks: RichBlock[]) {
  return Promise.all(
    blocks.map(async (block) => {
      const bucket = block.mediaBucket ?? 'note_media';

      if (block.type === 'image' && block.imageStoragePath) {
        return {
          ...block,
          imageUri: await getSignedMediaUri(bucket, block.imageStoragePath, block.imageUri),
        };
      }

      if (block.type === 'audio' && block.audioStoragePath) {
        return {
          ...block,
          audioUri: await getSignedMediaUri(bucket, block.audioStoragePath, block.audioUri),
        };
      }

      return block;
    }),
  );
}

function isMissingTableError(error: unknown) {
  return !!error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === 'PGRST205';
}

function mapCloudNote(n: any): DiaryNote {
  return {
    id: n.id,
    date: n.date_key,
    title: n.title || '',
    text: n.text_content || '',
    richContent: n.rich_content || [],
    color: n.color || '#FDF2F8',
    createdAt: n.created_at_ms || Date.now(),
    updatedAt: n.updated_at ? Date.parse(n.updated_at) : n.created_at_ms || Date.now(),
  };
}

async function fetchNotesFromTable(userId: string, table: string): Promise<DiaryNote[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  if (error) {
    if (!isMissingTableError(error)) console.warn(`Failed to fetch notes from ${table}`, error);
    return [];
  }

  const mappedNotes: DiaryNote[] = (data || []).map(mapCloudNote);
  for (const note of mappedNotes) {
    note.richContent = await hydrateRichContentMedia(note.richContent ?? []);
  }
  return mappedNotes;
}

export async function syncNoteToCloud(userId: string, note: DiaryNote): Promise<DiaryNote | null> {
  return syncNoteToTable(userId, note, 'diary_notes', 'diary_note_media');
}

export async function syncSecretNoteToCloud(userId: string, note: DiaryNote): Promise<DiaryNote | null> {
  return syncNoteToTable(userId, note, 'private_diary_notes', 'private_diary_note_media');
}

async function syncNoteToTable(userId: string, note: DiaryNote, notesTable: string, mediaTable: string): Promise<DiaryNote | null> {
  try {
    const { mediaRows, updatedRichContent } = await prepareRichContentMedia(userId, note);

    const { error: noteError } = await supabase.from(notesTable).upsert({
      id: note.id,
      user_id: userId,
      date_key: note.date,
      title: note.title,
      text_content: note.text,
      rich_content: updatedRichContent,
      color: note.color,
      created_at_ms: note.createdAt,
    }, { onConflict: 'id,user_id' });
    if (noteError) throw noteError;

    const { error: deleteMediaError } = await supabase.from(mediaTable).delete().match({ note_id: note.id, user_id: userId });
    if (deleteMediaError) throw deleteMediaError;
    if (mediaRows.length > 0) {
      const { error } = await supabase.from(mediaTable).insert(mediaRows);
      if (error) throw error;
    }

    return {
      ...note,
      richContent: updatedRichContent,
    };
  } catch (error) {
    if (!isMissingTableError(error)) console.warn(`Failed to sync note to ${notesTable}`, error);
    return null;
  }
}

function isMissingProfileOptionalColumnError(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const message = 'message' in error ? String((error as { message?: unknown }).message ?? '') : '';
  const details = 'details' in error ? String((error as { details?: unknown }).details ?? '') : '';
  return (
    message.includes('private_diary_pin') ||
    message.includes('private_diary_enabled') ||
    details.includes('private_diary_pin') ||
    details.includes('private_diary_enabled')
  );
}

export async function deleteNoteFromCloud(userId: string, noteId: string) {
  return deleteNoteFromTable(userId, noteId, 'diary_notes');
}

export async function deleteSecretNoteFromCloud(userId: string, noteId: string) {
  return deleteNoteFromTable(userId, noteId, 'private_diary_notes');
}

async function deleteNoteFromTable(userId: string, noteId: string, notesTable: string) {
  try {
    const { error } = await supabase.from(notesTable).delete().match({ id: noteId, user_id: userId });
    if (error) throw error;
  } catch (error) {
    if (!isMissingTableError(error)) console.warn(`Failed to delete note from ${notesTable}`, error);
  }
}

export async function syncEntryToCloud(userId: string, entry: DiaryEntry) {
  try {
    const { error } = await supabase.from('diary_entries').upsert({
      id: entry.id,
      user_id: userId,
      mood: entry.mood,
      mood_emoji: entry.moodEmoji,
      note: entry.note,
      card_color: entry.cardColor,
    }, { onConflict: 'id,user_id' });
    if (error) throw error;
    return true;
  } catch (error) {
    console.warn('Failed to sync entry', error);
    return false;
  }
}

export async function deleteEntryFromCloud(userId: string, entryId: string) {
  try {
    const { error } = await supabase.from('diary_entries').delete().match({ id: entryId, user_id: userId });
    if (error) throw error;
    return true;
  } catch (error) {
    console.warn('Failed to delete entry', error);
    return false;
  }
}

export async function syncRoutineToCloud(userId: string, routine: RoutineTemplate) {
  try {
    const { error } = await supabase.from('custom_routines').upsert({
      id: routine.id,
      user_id: userId,
      title: routine.title,
      title_en: routine.titleEn,
      subtitle: routine.subtitle,
      subtitle_en: routine.subtitleEn,
      icon: routine.emoji,
      color: routine.color,
      steps: routine.steps,
    }, { onConflict: 'id,user_id' });
    if (error) throw error;
    return true;
  } catch (error) {
    console.warn('Failed to sync custom routine', error);
    return false;
  }
}

export async function deleteRoutineFromCloud(userId: string, routineId: string) {
  try {
    const { error } = await supabase.from('custom_routines').delete().match({ id: routineId, user_id: userId });
    if (error) throw error;
    return true;
  } catch (error) {
    console.warn('Failed to delete custom routine', error);
    return false;
  }
}

export async function fetchCloudData(userId: string): Promise<Partial<AppData> | null> {
  try {
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!profile) {
      const { data: insertedProfile, error: insertProfileError } = await supabase
        .from('profiles')
        .insert({ id: userId })
        .select('*')
        .maybeSingle();

      if (insertProfileError) {
        console.warn('Failed to create profile before fetching cloud data', insertProfileError);
      } else {
        profile = insertedProfile;
      }
    }

    const [
      mappedNotes,
      mappedSecretNotes,
      { data: entries },
      { data: routines }
    ] = await Promise.all([
      fetchNotesFromTable(userId, 'diary_notes'),
      fetchNotesFromTable(userId, 'private_diary_notes'),
      supabase.from('diary_entries').select('*').eq('user_id', userId).is('deleted_at', null).order('updated_at', { ascending: false }),
      supabase.from('custom_routines').select('*').eq('user_id', userId).is('deleted_at', null).order('updated_at', { ascending: false })
    ]);

    const mappedEntries: Record<string, DiaryEntry> = {};
    (entries || []).forEach((e: any) => {
      mappedEntries[e.id] = {
        id: e.id,
        mood: e.mood,
        moodEmoji: e.mood_emoji,
        note: e.note || '',
        cardColor: e.card_color || '#fff',
        updatedAt: e.updated_at ? Date.parse(e.updated_at) : Date.now(),
      };
    });

    const mappedRoutines: RoutineTemplate[] = (routines || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      titleEn: r.title_en,
      subtitle: r.subtitle || '',
      subtitleEn: r.subtitle_en || '',
      emoji: r.icon || '',
      color: r.color || '#C2185B',
      steps: r.steps || [],
      custom: true,
    }));

    return {
      streak: profile?.streak || 0,
      lastStreakDate: profile?.last_streak_date,
      totalRoutinesCompleted: profile?.total_routines_completed || 0,
      favoriteRoutineId: profile?.favorite_routine_id,
      visionBoardMode: profile?.vision_board_mode || 'square',
      favoriteAdvice: profile?.favorite_advice || [],
      glowUpProgress: profile?.glow_up_progress || {},
      detoxChallenge: profile?.detox_challenge || { challengeId: null, startDate: null, checkedInDays: [] },
      routineProgress: profile?.routine_progress || {},
      completedRoutines: profile?.completed_routines || {},
      lastRoutineResetDate: profile?.last_routine_reset_date,
      diaryNotes: mappedNotes,
      secretDiaryPin: profile?.private_diary_pin ?? null,
      secretDiaryEnabled: profile?.private_diary_enabled ?? !!profile?.private_diary_pin,
      secretDiaryNotes: mappedSecretNotes,
      diaryEntries: mappedEntries,
      customRoutines: mappedRoutines,
      profileName: profile?.name || '',
      profilePhoto: profile?.avatar_url
        ? await getSignedMediaUri('avatars', profile.avatar_url, profile.avatar_url)
        : null,
      profilePhotoStoragePath: profile?.avatar_url ?? null,
      visionBoardImage: profile?.vision_board_image_url
        ? await getSignedMediaUri('vision_board', profile.vision_board_image_url, profile.vision_board_image_url)
        : null,
      visionBoardStoragePath: profile?.vision_board_image_url ?? null,
    };
  } catch (error) {
    console.warn('Failed to fetch cloud data', error);
    return null;
  }
}
