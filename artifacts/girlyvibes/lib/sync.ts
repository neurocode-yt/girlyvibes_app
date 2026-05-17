import { supabase } from './supabase';
import { AppData, DiaryNote, DiaryEntry, RichBlock } from '@/contexts/AppContext';
import { RoutineTemplate } from '@/data/routines';
import * as FileSystem from 'expo-file-system/legacy';

interface UploadedMedia {
  bucket: string;
  fileName: string;
  mimeType: string;
  publicUri: string;
  size: number;
  storagePath: string;
}

function getMediaInfo(uri: string, bucket: string) {
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
  return !!uri && (uri.startsWith('file://') || uri.startsWith('content://'));
}

function isRemoteMediaUri(uri: string | null | undefined) {
  return !!uri && (uri.startsWith('http://') || uri.startsWith('https://'));
}

function base64ToArrayBuffer(base64: string) {
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

  return new Uint8Array(bytes).buffer;
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
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const body = base64ToArrayBuffer(base64);

    const { error } = await supabase.storage.from(bucket).upload(storagePath, body, {
      cacheControl: '3600',
      contentType: mimeType,
      upsert: true,
    });

    if (error) throw error;

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

    const profilePayload = {
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

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(profilePayload)
      .eq('id', userId)
      .select('id')
      .maybeSingle();

    if (updateError) throw updateError;

    if (!updatedProfile) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId, ...profilePayload });

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

export async function syncNoteToCloud(userId: string, note: DiaryNote): Promise<DiaryNote | null> {
  try {
    const { mediaRows, updatedRichContent } = await prepareRichContentMedia(userId, note);

    await supabase.from('diary_notes').upsert({
      id: note.id,
      user_id: userId,
      date_key: note.date,
      title: note.title,
      text_content: note.text,
      rich_content: updatedRichContent,
      color: note.color,
      created_at_ms: note.createdAt,
    }, { onConflict: 'id,user_id' });

    await supabase.from('diary_note_media').delete().match({ note_id: note.id, user_id: userId });
    if (mediaRows.length > 0) {
      const { error } = await supabase.from('diary_note_media').insert(mediaRows);
      if (error) throw error;
    }

    return {
      ...note,
      richContent: updatedRichContent,
    };
  } catch (error) {
    console.warn('Failed to sync note', error);
    return null;
  }
}

export async function deleteNoteFromCloud(userId: string, noteId: string) {
  try {
    await supabase.from('diary_notes').delete().match({ id: noteId, user_id: userId });
  } catch (error) {
    console.warn('Failed to delete note', error);
  }
}

export async function syncEntryToCloud(userId: string, entry: DiaryEntry) {
  try {
    await supabase.from('diary_entries').upsert({
      id: entry.id,
      user_id: userId,
      mood: entry.mood,
      mood_emoji: entry.moodEmoji,
      note: entry.note,
      card_color: entry.cardColor,
    }, { onConflict: 'id,user_id' });
  } catch (error) {
    console.warn('Failed to sync entry', error);
  }
}

export async function deleteEntryFromCloud(userId: string, entryId: string) {
  try {
    await supabase.from('diary_entries').delete().match({ id: entryId, user_id: userId });
  } catch (error) {
    console.warn('Failed to delete entry', error);
  }
}

export async function syncRoutineToCloud(userId: string, routine: RoutineTemplate) {
  try {
    await supabase.from('custom_routines').upsert({
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
  } catch (error) {
    console.warn('Failed to sync custom routine', error);
  }
}

export async function deleteRoutineFromCloud(userId: string, routineId: string) {
  try {
    await supabase.from('custom_routines').delete().match({ id: routineId, user_id: userId });
  } catch (error) {
    console.warn('Failed to delete custom routine', error);
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
      { data: notes },
      { data: entries },
      { data: routines }
    ] = await Promise.all([
      supabase.from('diary_notes').select('*').eq('user_id', userId).is('deleted_at', null).order('updated_at', { ascending: false }),
      supabase.from('diary_entries').select('*').eq('user_id', userId).is('deleted_at', null).order('updated_at', { ascending: false }),
      supabase.from('custom_routines').select('*').eq('user_id', userId).is('deleted_at', null).order('updated_at', { ascending: false })
    ]);

    const mappedNotes: DiaryNote[] = (notes || []).map((n: any) => ({
      id: n.id,
      date: n.date_key,
      title: n.title || '',
      text: n.text_content || '',
      richContent: n.rich_content || [],
      color: n.color || '#FDF2F8',
      createdAt: n.created_at_ms || Date.now(),
      updatedAt: n.updated_at ? Date.parse(n.updated_at) : n.created_at_ms || Date.now(),
    }));

    for (const note of mappedNotes) {
      note.richContent = await hydrateRichContentMedia(note.richContent ?? []);
    }

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
