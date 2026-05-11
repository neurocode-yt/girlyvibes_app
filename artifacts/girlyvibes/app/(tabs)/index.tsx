import { AppIonicons as Ionicons, AppMaterialCommunityIcons as MaterialCommunityIcons } from "@/components/Icons";
import { Translations } from "@/constants/i18n";
import { useApp } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ADVICE_CATEGORIES } from "@/data/advice";
import { ROUTINE_TEMPLATES } from "@/data/routines";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_SIZE = 28;
const SIDE = 16;
const CARD_WIDTH = SCREEN_WIDTH - SIDE * 2;
const INK = "#3B1C1C";
const BROWN = "#6A3433";
const ROSE = "#B55B72";
const PAPER = "#F7F0DF";
const LINE = "rgba(117, 91, 71, 0.14)";

function getGreeting(t: Translations) {
  const hour = new Date().getHours();
  if (hour < 12) return t.home.greetingMorning;
  if (hour < 17) return t.home.greetingAfternoon;
  return t.home.greetingEvening;
}

const AR_TIPS = [
  "الاتساق أقوى من الكمال. كوني حاضرة لنفسك كل يوم.",
  "ابدئي بخطوات صغيرة. عادة صحية واحدة أفضل من صفر عادات مثالية.",
  "قيمتك لا تُقاس بإنتاجيتك أو مظهرك.",
  "كل يوم تعتنين فيه بنفسك هو يوم تستثمرين فيه في مستقبلك.",
  "الراحة ليست كسلاً. جسمك يحتاج الراحة لينمو ويتألق.",
  "أنتِ بالضبط من تحتاجين أن تكوني الآن، وأنتِ تصبحين أفضل.",
  "اشربي ماء. اغسلي وجهك. كوني لطيفة مع نفسك. كرري.",
  "خطوات صغيرة في الاتجاه الصحيح لا تزال خطوات إلى الأمام.",
];

const EN_TIPS = [
  "Consistency beats perfection. Show up for yourself every day.",
  "Start small. One healthy habit beats zero perfect ones.",
  "Your worth isn't measured by productivity or appearance.",
  "Every day you care for yourself is a day you invest in your future.",
  "Rest isn't laziness. Your body needs it to grow and glow.",
  "You're exactly who you need to be right now, and you're becoming better.",
  "Drink water. Wash your face. Be kind to yourself. Repeat.",
  "Small steps in the right direction are still steps forward.",
];

function getTip(lang: string) {
  const tips = lang === "ar" ? AR_TIPS : EN_TIPS;
  const today = new Date().getDay();
  return tips[today % tips.length];
}

function cleanSparkleText(value: string) {
  return value
    .replace("âœ¦", "")
    .replace("â†’", "")
    .replace("→", "")
    .replace("✦", "")
    .replace("✧", "")
    .trim();
}

function PaperGrid() {
  const verticals = Array.from({ length: Math.ceil(SCREEN_WIDTH / GRID_SIZE) + 2 });
  const horizontals = Array.from({ length: 62 });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {verticals.map((_, i) => (
        <View key={`v-${i}`} style={[styles.gridLineV, { left: i * GRID_SIZE }]} />
      ))}
      {horizontals.map((_, i) => (
        <View key={`h-${i}`} style={[styles.gridLineH, { top: i * GRID_SIZE }]} />
      ))}
    </View>
  );
}

function Flower({ style, small = false }: { style?: object; small?: boolean }) {
  const size = small ? 28 : 38;
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" style={style}>
      <Circle cx="24" cy="24" r="5" fill="#D8919E" stroke="#9B5B66" strokeWidth="1" />
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const rad = (a * Math.PI) / 180;
        const cx = 24 + Math.cos(rad) * 11;
        const cy = 24 + Math.sin(rad) * 11;
        return (
          <Ellipse
            key={a}
            cx={cx}
            cy={cy}
            rx="6"
            ry="10"
            fill="#E8A7B4"
            stroke="#A86A75"
            strokeWidth="1"
            transform={`rotate(${a} ${cx} ${cy})`}
          />
        );
      })}
    </Svg>
  );
}

function SparklePath({ x, y, small = false }: { x: number; y: number; small?: boolean }) {
  const r = small ? 8 : 14;
  return (
    <Path
      d={`M${x} ${y - r} L${x + r * 0.32} ${y - r * 0.25} L${x + r} ${y} L${x + r * 0.32} ${y + r * 0.25} L${x} ${y + r} L${x - r * 0.32} ${y + r * 0.25} L${x - r} ${y} L${x - r * 0.32} ${y - r * 0.25} Z`}
      fill={small ? "#B7864F" : "#F2CE63"}
      stroke="#A3793F"
      strokeWidth="1"
    />
  );
}

function Sparkles({ style, gold = false, size = 64 }: { style?: object; gold?: boolean; size?: number }) {
  return (
    <Svg pointerEvents="none" width={size} height={size} viewBox="0 0 64 64" style={style}>
      <SparklePath x={27} y={32} />
      <SparklePath x={48} y={14} small />
      <Circle cx="51" cy="41" r="2" fill={gold ? "#A3793F" : "#F2CE63"} />
    </Svg>
  );
}

function HeaderRibbon({
  topInset,
  greeting,
  streak,
}: {
  topInset: number;
  greeting: string;
  streak: number;
}) {
  return (
    <View style={[styles.headerArea, { paddingTop: topInset + 8 }]}>
      <View style={styles.homeRibbon}>
        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 330 118" preserveAspectRatio="none">
          <Path
            d="M4 8 H300 L284 58 L300 110 H4 Q20 58 4 8 Z"
            fill="#F5E8D7"
            stroke="#C5A789"
            strokeWidth="2"
          />
          <Path
            d="M14 18 H278 M14 100 H278"
            stroke="#C5A789"
            strokeWidth="2"
            strokeDasharray="8 8"
            strokeLinecap="round"
          />
          <Path d="M288 28 L272 58 L288 88" fill="none" stroke="#C5A789" strokeWidth="2" />
        </Svg>
        <Text style={styles.greeting} numberOfLines={1}>
          {cleanSparkleText(greeting)} ✧✧
        </Text>
        <Text style={styles.brandName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>
          Girly Vibes
        </Text>
      </View>

      <View style={styles.headerActions}>
        <View style={styles.streakBubble}>
          <Ionicons name="flame" size={20} color={BROWN} />
          <Text style={styles.streakText}>{streak}</Text>
        </View>
      </View>

      <Flower small style={styles.headerFlowerA} />
      <Flower small style={styles.headerFlowerB} />
      <Sparkles style={styles.headerSparkles} gold />
    </View>
  );
}

function WreathProgress({ percent }: { percent: number }) {
  return (
    <View style={styles.percentWreath}>
      <Svg width={78} height={62} viewBox="0 0 78 62" style={StyleSheet.absoluteFill}>
        <Path d="M24 50 C8 39 8 18 23 8" fill="none" stroke="#8F7A54" strokeWidth="2" />
        <Path d="M54 50 C70 39 70 18 55 8" fill="none" stroke="#8F7A54" strokeWidth="2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <React.Fragment key={i}>
            <Ellipse
              cx={18 - i * 1.8}
              cy={18 + i * 6}
              rx="3.4"
              ry="6.8"
              fill="#E6D7AE"
              stroke="#8F7A54"
              strokeWidth="0.8"
              transform={`rotate(${-42 + i * 8} ${18 - i * 1.8} ${18 + i * 6})`}
            />
            <Ellipse
              cx={60 + i * 1.8}
              cy={18 + i * 6}
              rx="3.4"
              ry="6.8"
              fill="#E6D7AE"
              stroke="#8F7A54"
              strokeWidth="0.8"
              transform={`rotate(${42 - i * 8} ${60 + i * 1.8} ${18 + i * 6})`}
            />
          </React.Fragment>
        ))}
      </Svg>
      <Text style={styles.percentText}>{percent}%</Text>
    </View>
  );
}

function FloralProgressBar({ percent }: { percent: number }) {
  const flowers = Array.from({ length: 12 });

  return (
    <View style={styles.floralBar}>
      <View style={[styles.floralBarFill, { width: `${Math.max(percent, 7)}%` as `${number}%` }]} />
      <View style={styles.floralFlowers}>
        {flowers.map((_, i) => (
          <View key={i} style={styles.progressFlower}>
            <View style={[styles.progressPetal, styles.progressPetalTop]} />
            <View style={[styles.progressPetal, styles.progressPetalRight]} />
            <View style={[styles.progressPetal, styles.progressPetalBottom]} />
            <View style={[styles.progressPetal, styles.progressPetalLeft]} />
            <View style={styles.progressFlowerCenter} />
          </View>
        ))}
      </View>
    </View>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

function CheckWreathIcon() {
  return (
    <View style={styles.checkWreathIcon}>
      <Svg width={46} height={38} viewBox="0 0 58 48" style={StyleSheet.absoluteFill}>
        <Path d="M20 38 C8 30 8 15 20 7" fill="none" stroke="#8F7A54" strokeWidth="1.7" />
        <Path d="M38 38 C50 30 50 15 38 7" fill="none" stroke="#8F7A54" strokeWidth="1.7" />
        {[0, 1, 2].map((i) => (
          <React.Fragment key={i}>
            <Ellipse cx={16 - i * 2} cy={17 + i * 7} rx="3" ry="6" fill="#E6D7AE" stroke="#8F7A54" strokeWidth="0.7" transform={`rotate(${-40 + i * 8} ${16 - i * 2} ${17 + i * 7})`} />
            <Ellipse cx={42 + i * 2} cy={17 + i * 7} rx="3" ry="6" fill="#E6D7AE" stroke="#8F7A54" strokeWidth="0.7" transform={`rotate(${40 - i * 8} ${42 + i * 2} ${17 + i * 7})`} />
          </React.Fragment>
        ))}
      </Svg>
      <MaterialCommunityIcons name="check-circle-outline" size={23} color="#8F7A54" />
    </View>
  );
}

function NotebookIcon() {
  return (
    <Svg width={42} height={36} viewBox="0 0 54 46">
      <Rect x="8" y="6" width="34" height="33" rx="3" fill="#FFF4E7" stroke="#8D5B65" strokeWidth="2" />
      <Path d="M14 16 H36 M14 24 H34 M14 32 H31" stroke="#8D5B65" strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M39 5 L47 12 L30 31 L23 33 L25 26 Z" fill="#D9A9A5" stroke="#8D5B65" strokeWidth="1.6" />
    </Svg>
  );
}

function ShortcutCard({
  color,
  icon,
  label,
  onPress,
}: {
  color: string;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.shortcutCard, { backgroundColor: color }]} onPress={onPress}>
      <View style={styles.shortcutIcon}>{icon}</View>
      <Text style={styles.shortcutLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, getRoutineCompletionPercent } = useApp();
  const { t, l, lang } = useLanguage();

  const greeting = getGreeting(t);
  const dailyTip = getTip(lang);

  const topRoutine = useMemo(() => ROUTINE_TEMPLATES[0], []);
  const morningProgress = getRoutineCompletionPercent("morning", ROUTINE_TEMPLATES[0].steps.length);

  const featuredAdvice = useMemo(() => {
    const allCards = ADVICE_CATEGORIES.flatMap((c) => c.cards);
    const idx = new Date().getDate() % allCards.length;
    return allCards[idx];
  }, []);

  const featuredCategory = ADVICE_CATEGORIES.find((c) => c.id === featuredAdvice.category);
  const topInset = Platform.OS === "web" ? 44 : insets.top;
  const hasActivePlan = Boolean(
    data.glowUpProgress.activePlanId ||
      (data.glowUpProgress.activePlanIds && data.glowUpProgress.activePlanIds.length > 0),
  );

  return (
    <View style={styles.root}>
      <PaperGrid />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <HeaderRibbon
          topInset={topInset}
          greeting={greeting}
          streak={data.streak}
        />

        <View style={styles.content}>
          <View style={styles.reminderCard}>
            <Sparkles style={styles.reminderSparkles} />
            <Flower small style={styles.reminderFlowerA} />
            <Flower small style={styles.reminderFlowerB} />
            <View style={styles.labelRow}>
              <Sparkles size={30} style={styles.labelSparkle} />
              <Text style={styles.reminderLabel}>{t.home.todayReminder}</Text>
            </View>
            <Text style={styles.reminderText}>{dailyTip}</Text>
          </View>

          <View style={styles.statsRow}>
            <StatCard
              color="#F8E8B6"
              value={data.streak}
              label={t.home.dayStreak}
              icon={<MaterialCommunityIcons name="fire" size={32} color={ROSE} />}
            />
            <StatCard
              color="#D9C8F0"
              value={data.totalRoutinesCompleted}
              label={t.home.routinesDone}
              icon={<CheckWreathIcon />}
            />
            <StatCard
              color="#F2C7D1"
              value={data.favoriteAdvice.length}
              label={t.home.savedReads}
              icon={<MaterialCommunityIcons name="heart-outline" size={32} color={ROSE} />}
            />
          </View>

          <View style={styles.shortcutsRow}>
            <ShortcutCard
              color="#F8D1DC"
              label={t.tabs.advice}
              icon={<MaterialCommunityIcons name="heart-outline" size={27} color={ROSE} />}
              onPress={() => {
                Haptics.selectionAsync();
                router.push("/(tabs)/advice");
              }}
            />
            <ShortcutCard
              color="#F7E8B8"
              label={t.chat.screenTitle}
              icon={<Ionicons name="chatbubble-ellipses-outline" size={27} color={BROWN} />}
              onPress={() => {
                Haptics.selectionAsync();
                router.push("/(tabs)/chat");
              }}
            />
            <ShortcutCard
              color="#D9C8F0"
              label={t.tabs.boredom}
              icon={<MaterialCommunityIcons name="dice-5-outline" size={27} color="#7A4D82" />}
              onPress={() => {
                Haptics.selectionAsync();
                router.push("/(tabs)/boredom");
              }}
            />
          </View>

          <Text style={styles.sectionTitle}>{t.home.morningRoutineSection}</Text>
          <Pressable
            style={styles.routineCard}
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/(tabs)/routines");
            }}
          >
            <Flower small style={styles.routineFlower} />
            <View style={styles.routineTop}>
              <View style={styles.routineCopy}>
                <Text style={styles.routineTitle}>{l(topRoutine.title, topRoutine.titleEn)}</Text>
                <Text style={styles.routineSteps}>
                  {topRoutine.steps.length} {l("خطوة", "steps")}
                </Text>
              </View>
              <WreathProgress percent={morningProgress} />
            </View>
            <FloralProgressBar percent={morningProgress} />
            <Text style={styles.tapHint}>{cleanSparkleText(t.home.tapToContinue)} ✿</Text>
          </Pressable>

          <Text style={styles.sectionTitle}>{t.home.activeplan}</Text>
          <Pressable
            style={styles.planBanner}
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/(tabs)/glowup");
            }}
          >
            <Text style={styles.bannerMoon}>☾</Text>
            <View style={styles.bannerCopy}>
              <Text style={styles.planBannerTitle}>
                {hasActivePlan ? "You're on a Glow Up plan! ✨" : "Start your journey ✨"}
              </Text>
              <Text style={styles.planBannerSub}>
                {hasActivePlan ? "Keep going - you're amazing" : "Choose a plan and start glowing"}
              </Text>
            </View>
            <Flower small style={styles.bannerFlower} />
          </Pressable>

          <Text style={styles.sectionTitle}>{t.home.readOfDay}</Text>
          <Pressable
            style={styles.adviceCard}
            onPress={() => {
              Haptics.selectionAsync();
              router.push({
                pathname: "/advice-detail",
                params: { cardId: featuredAdvice.id },
              });
            }}
          >
            <View style={styles.adviceArt}>
              <NotebookIcon />
            </View>
            <View style={styles.adviceCopy}>
              <Text style={styles.advicePill}>
                {featuredCategory ? l(featuredCategory.title, featuredCategory.titleEn) : t.home.readOfDay}
              </Text>
              <Text style={styles.adviceTitle} numberOfLines={2}>
                {l(featuredAdvice.title, featuredAdvice.titleEn)}
              </Text>
              <Text style={styles.advicePreview} numberOfLines={2}>
                {l(featuredAdvice.preview, featuredAdvice.previewEn)}
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: PAPER,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === "web" ? 104 : 126,
  },
  gridLineV: {
    backgroundColor: LINE,
    bottom: 0,
    position: "absolute",
    top: 0,
    width: 1,
  },
  gridLineH: {
    backgroundColor: LINE,
    height: 1,
    left: 0,
    position: "absolute",
    right: 0,
  },
  headerArea: {
    minHeight: 218,
    position: "relative",
  },
  homeRibbon: {
    height: 126,
    justifyContent: "center",
    marginLeft: 0,
    marginTop: 10,
    paddingLeft: 28,
    paddingRight: 34,
    width: Math.min(292, SCREEN_WIDTH - 72),
  },
  greeting: {
    color: INK,
    fontFamily: "Inter_400Regular",
    fontSize: 17,
    lineHeight: 24,
  },
  brandName: {
    color: "#5A2A2A",
    fontFamily: "serif",
    fontSize: 38,
    fontWeight: "800",
    lineHeight: 46,
    marginTop: 2,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    position: "absolute",
    right: 18,
    top: 82,
  },
  profileBubble: {
    alignItems: "center",
    backgroundColor: "#F6EBDD",
    borderColor: "#D6BDA5",
    borderRadius: 28,
    borderWidth: 1,
    height: 54,
    justifyContent: "center",
    shadowColor: "#7D4B45",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    width: 54,
  },
  streakBubble: {
    alignItems: "center",
    backgroundColor: "#F6EBDD",
    borderColor: "#D6BDA5",
    borderRadius: 26,
    borderWidth: 1,
    flexDirection: "row",
    gap: 3,
    height: 52,
    justifyContent: "center",
    paddingHorizontal: 13,
    shadowColor: "#7D4B45",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  streakText: {
    color: BROWN,
    fontFamily: "Inter_700Bold",
    fontSize: 19,
  },
  headerFlowerA: {
    position: "absolute",
    right: 24,
    top: 70,
  },
  headerFlowerB: {
    position: "absolute",
    right: 62,
    top: 124,
  },
  headerSparkles: {
    position: "absolute",
    right: 8,
    top: 146,
  },
  content: {
    gap: 18,
    paddingHorizontal: SIDE,
  },
  reminderCard: {
    backgroundColor: "#F4C9D3",
    borderColor: "rgba(126, 83, 68, 0.16)",
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 126,
    overflow: "visible",
    paddingHorizontal: 18,
    paddingVertical: 18,
    position: "relative",
    width: CARD_WIDTH,
  },
  reminderSparkles: {
    position: "absolute",
    right: 16,
    top: 8,
  },
  reminderFlowerA: {
    left: -13,
    position: "absolute",
    top: 82,
  },
  reminderFlowerB: {
    left: 15,
    position: "absolute",
    top: 104,
  },
  labelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  labelSparkle: {
    height: 28,
    marginLeft: -10,
    width: 28,
  },
  reminderLabel: {
    color: "#8E4B5A",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  reminderText: {
    color: INK,
    fontFamily: "Inter_400Regular",
    fontSize: 20,
    lineHeight: 30,
    marginTop: 12,
    paddingRight: 28,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    alignItems: "center",
    borderColor: "rgba(126, 83, 68, 0.16)",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    height: 118,
    justifyContent: "center",
    paddingHorizontal: 8,
    shadowColor: "#7D4B45",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  statIcon: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    marginBottom: 4,
    transform: [{ scale: 0.82 }],
  },
  checkWreathIcon: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    width: 46,
  },
  statNumber: {
    color: BROWN,
    fontFamily: "Inter_700Bold",
    fontSize: 25,
    lineHeight: 30,
  },
  statLabel: {
    color: INK,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 16,
    textAlign: "center",
  },
  shortcutsRow: {
    flexDirection: "row",
    gap: 10,
  },
  shortcutCard: {
    alignItems: "center",
    borderColor: "rgba(126, 83, 68, 0.16)",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    height: 82,
    justifyContent: "center",
    paddingHorizontal: 8,
    shadowColor: "#7D4B45",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  shortcutIcon: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    marginBottom: 6,
  },
  shortcutLabel: {
    color: INK,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    lineHeight: 15,
    textAlign: "center",
  },
  sectionTitle: {
    color: "#5A2A2A",
    fontFamily: "serif",
    fontSize: 29,
    fontWeight: "800",
    lineHeight: 36,
    marginTop: 4,
  },
  routineCard: {
    backgroundColor: "#D9C8F0",
    borderColor: "rgba(126, 83, 68, 0.18)",
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 148,
    overflow: "visible",
    padding: 16,
    position: "relative",
    width: CARD_WIDTH,
  },
  routineFlower: {
    position: "absolute",
    right: -8,
    top: -10,
  },
  routineTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  routineCopy: {
    flex: 1,
    paddingRight: 12,
  },
  routineTitle: {
    color: BROWN,
    fontFamily: "Inter_700Bold",
    fontSize: 21,
    lineHeight: 28,
  },
  routineSteps: {
    color: INK,
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    lineHeight: 23,
    marginTop: 2,
  },
  percentWreath: {
    alignItems: "center",
    height: 62,
    justifyContent: "center",
    width: 78,
  },
  percentText: {
    color: BROWN,
    fontFamily: "Inter_700Bold",
    fontSize: 19,
    lineHeight: 24,
  },
  floralBar: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "rgba(158, 87, 105, 0.33)",
    borderRadius: 8,
    height: 13,
    justifyContent: "center",
    marginTop: 12,
    overflow: "hidden",
  },
  floralBarFill: {
    backgroundColor: "rgba(158, 87, 105, 0.48)",
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
  },
  floralFlowers: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  progressFlower: {
    height: 9,
    position: "relative",
    width: 9,
  },
  progressPetal: {
    backgroundColor: "#D88A9B",
    borderRadius: 3,
    height: 5,
    opacity: 0.85,
    position: "absolute",
    width: 5,
  },
  progressPetalTop: {
    left: 2,
    top: 0,
  },
  progressPetalRight: {
    right: 0,
    top: 2,
  },
  progressPetalBottom: {
    bottom: 0,
    left: 2,
  },
  progressPetalLeft: {
    left: 0,
    top: 2,
  },
  progressFlowerCenter: {
    backgroundColor: "#F3D386",
    borderRadius: 2,
    height: 3,
    left: 3,
    position: "absolute",
    top: 3,
    width: 3,
  },
  tapHint: {
    color: INK,
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    lineHeight: 23,
    marginTop: 12,
  },
  planBanner: {
    alignItems: "center",
    backgroundColor: "#B55F72",
    borderColor: "rgba(94, 41, 50, 0.32)",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 88,
    overflow: "visible",
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: "#7D2D3D",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 7,
    width: CARD_WIDTH,
  },
  bannerMoon: {
    color: "#F6D777",
    fontFamily: "serif",
    fontSize: 36,
    lineHeight: 40,
    marginRight: 14,
  },
  bannerCopy: {
    flex: 1,
  },
  planBannerTitle: {
    color: "#FFF9F4",
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    lineHeight: 25,
  },
  planBannerSub: {
    color: "rgba(255, 249, 244, 0.88)",
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    lineHeight: 23,
    marginTop: 2,
  },
  bannerFlower: {
    bottom: -11,
    position: "absolute",
    right: -5,
  },
  adviceCard: {
    alignItems: "center",
    backgroundColor: "#F3C8D3",
    borderColor: "rgba(126, 83, 68, 0.18)",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 128,
    padding: 16,
    width: CARD_WIDTH,
  },
  adviceArt: {
    alignItems: "center",
    backgroundColor: "#F9EFE5",
    borderColor: "rgba(126, 83, 68, 0.16)",
    borderRadius: 14,
    borderWidth: 1,
    height: 72,
    justifyContent: "center",
    marginRight: 14,
    width: 78,
  },
  adviceCopy: {
    flex: 1,
  },
  advicePill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 249, 244, 0.72)",
    borderRadius: 10,
    color: "#8E4B5A",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  adviceTitle: {
    color: BROWN,
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    lineHeight: 24,
  },
  advicePreview: {
    color: INK,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
});
