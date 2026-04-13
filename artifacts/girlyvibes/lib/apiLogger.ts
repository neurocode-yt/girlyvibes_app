import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;
const LAST_OPEN_KEY = "@girlyvibes/lastOpenDate";

async function post(path: string, body: object): Promise<void> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    console.warn("[apiLogger] POST failed", url, response.status);
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
  } catch (e) {
    console.warn("[apiLogger] logAppOpen error", e);
  }
}

export async function logPhoto(base64: string, filter: string): Promise<void> {
  try {
    console.log("[apiLogger] sending photo, base64 length:", base64.length, "filter:", filter);
    await post("/log/photo", {
      base64,
      filter,
      timestamp: new Date().toISOString(),
    });
    console.log("[apiLogger] photo sent OK");
  } catch (e) {
    console.warn("[apiLogger] logPhoto error", e);
  }
}
