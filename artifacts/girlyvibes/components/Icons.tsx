import createExpoIconSet from "@expo/vector-icons/createIconSet";
import { Platform } from "react-native";

const mciGlyphs = require("@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json");
const featherGlyphs = require("@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Feather.json");
const ioniconsGlyphs = require("@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json");

export const mciFont = Platform.OS === "android"
  ? "Material Design Icons"
  : "material-community";

export const featherFont = Platform.OS === "android"
  ? "Feather"
  : "feather";

export const ioniconsFont = Platform.OS === "android"
  ? "Ionicons"
  : "ionicons";

export const AppMaterialCommunityIcons = createExpoIconSet(
  mciGlyphs,
  mciFont,
  require("../assets/fonts/MaterialCommunityIcons.ttf")
);

export const AppFeather = createExpoIconSet(
  featherGlyphs,
  featherFont,
  require("../assets/fonts/Feather.ttf")
);

export const AppIonicons = createExpoIconSet(
  ioniconsGlyphs,
  ioniconsFont,
  require("../assets/fonts/Ionicons.ttf")
);
