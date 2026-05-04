import type { ImageProps } from "expo-image";

type ActivityImageSource = NonNullable<ImageProps["source"]>;

const images: Record<string, ActivityImageSource> = {
  room: require("@/assets/images/activities/room.jpg"),
  creativity: require("@/assets/images/activities/creativity.jpg"),
  nature: require("@/assets/images/activities/nature.jpg"),
  cooking: require("@/assets/images/activities/cooking.jpg"),
  reading: require("@/assets/images/activities/reading.jpg"),
  beauty: require("@/assets/images/activities/beauty.jpg"),
  fitness: require("@/assets/images/activities/fitness.jpg"),
  music: require("@/assets/images/activities/music.jpg"),
  writing: require("@/assets/images/activities/writing.jpg"),
  games: require("@/assets/images/activities/games.jpg"),
};

export function getActivityImage(key: string): ActivityImageSource {
  return images[key] ?? images.creativity;
}
