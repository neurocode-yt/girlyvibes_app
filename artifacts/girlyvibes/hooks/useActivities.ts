import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ACTIVITIES, type Activity } from "@/data/boredom";

const CACHE_KEY = "@girlyvibes/activities_v2";
const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

async function fetchActivitiesFromApi(): Promise<Activity[]> {
  const res = await fetch(`${API_BASE}/activities`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch activities");
  const data = await res.json();
  return data as Activity[];
}

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>(ACTIVITIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached && !cancelled) {
          setActivities(JSON.parse(cached));
          setLoading(false);
        }
      } catch {
        // ignore cache errors
      }

      try {
        const fresh = await fetchActivitiesFromApi();
        if (!cancelled && fresh.length > 0) {
          setActivities(fresh);
          setLoading(false);
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
        }
      } catch {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { activities, loading };
}
