import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;
const LAST_OPEN_KEY = "@girlyvibes/lastOpenDate";

async function post(path: string, body: object): Promise<void> {
  try {
    await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
  }
}

export async function logAppOpen(): Promise<void> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const last = await AsyncStorage.getItem(LAST_OPEN_KEY);
    if (last === today) return;
    await AsyncStorage.setItem(LAST_OPEN_KEY, today);

    await post("/log/open", {
      platform: Platform.OS,
      version: "1.0.0",
      locale: "ar",
      timestamp: new Date().toISOString(),
    });
  } catch {
  }
}

export async function logPhoto(uri: string, filter: string): Promise<void> {
  try {
    let base64: string | null = null;

    if (Platform.OS === "web") {
      if (uri.startsWith("data:")) {
        base64 = uri.split(",")[1] ?? null;
      }
    } else {
      base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    if (!base64) return;

    await post("/log/photo", {
      base64,
      filter,
      timestamp: new Date().toISOString(),
    });
  } catch {
  }
}
