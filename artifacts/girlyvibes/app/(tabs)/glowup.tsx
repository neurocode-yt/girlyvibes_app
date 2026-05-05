import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, Ellipse, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIonicons as Ionicons } from "@/components/Icons";
import { useApp } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { GLOW_UP_PLANS, type GlowUpPlan } from "@/data/glowupPlans";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_SIZE = 28;
const CARD_INSET = 18;
const CARD_WIDTH = SCREEN_WIDTH - CARD_INSET * 2;
const ART_WIDTH = Math.min(98, Math.round(CARD_WIDTH * 0.31));
const INK = "#2F1517";
const ROSE = "#B65A72";
const LINE = "rgba(117, 91, 71, 0.14)";

const PLAN_LOOK: Record<
  string,
  {
    bg: string;
    shadow: string;
    button: string;
    wash: [string, string, string];
    art: "plant" | "reset" | "butterfly";
  }
> = {
  "7day": {
    bg: "#FADDE1",
    shadow: "#EFC0C9",
    button: "#B75D73",
    wash: ["#FFF2C7", "#FADDE1", "#F6C7D1"],
    art: "plant",
  },
  "14day": {
    bg: "#D9C9F1",
    shadow: "#C2AEE7",
    button: "#F9EFE5",
    wash: ["#E6D9FA", "#D9C9F1", "#F3D8E5"],
    art: "reset",
  },
  "30day": {
    bg: "#C97882",
    shadow: "#B7606B",
    button: "#A24F61",
    wash: ["#D58A92", "#C97882", "#B86675"],
    art: "butterfly",
  },
};

function PaperGrid() {
  const verticals = Array.from({ length: Math.ceil(SCREEN_WIDTH / GRID_SIZE) + 2 });
  const horizontals = Array.from({ length: 44 });

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

function Flower({ style, small = false }: { style: object; small?: boolean }) {
  const size = small ? 28 : 42;
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

function Sparkles({ style, opacity = 0.52 }: { style?: object; opacity?: number }) {
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = Math.round((opacity % 0.2) * 1600);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(glow, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [glow, opacity]);

  const animatedOpacity = glow.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [opacity * 0.45, opacity * 0.82, opacity * 0.5],
  });
  const animatedScale = glow.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.96, 1.04, 0.98],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.sparkleWrap,
        styles.sparkleGlow,
        style,
        {
          opacity: animatedOpacity,
          transform: [{ scale: animatedScale }],
        },
      ]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 64 64">
        <Path
          d="M26 4 L34 25 L55 33 L34 41 L26 64 L18 41 L-3 33 L18 25 Z"
          fill="#FFF7B8"
          opacity="0.12"
        />
        <Path
          d="M26 9 L32 27 L50 33 L32 39 L26 59 L20 39 L2 33 L20 27 Z"
          fill="#FFF0A8"
          opacity="0.22"
        />
        <SparklePath x={26} y={31} />
        <Path
          d="M48 -1 L53 14 L68 20 L53 26 L48 42 L42 26 L28 20 L42 14 Z"
          fill="#FFF7B8"
          opacity="0.12"
        />
        <Path
          d="M48 3 L52 15 L64 20 L52 25 L48 38 L43 25 L32 20 L43 15 Z"
          fill="#FFF4B9"
          opacity="0.24"
        />
        <Path
          d="M48 7 L51 16 L60 20 L51 24 L48 33 L44 24 L36 20 L44 16 Z"
          fill="#F2CE63"
          stroke="#A3793F"
          strokeWidth="1.2"
        />
        <Path
          d="M45 39 L47 44 L52 46 L47 48 L45 54 L42 48 L37 46 L42 44 Z"
          fill="#B7864F"
          opacity="0.82"
        />
        <Circle cx="55" cy="38" r="2" fill="#B7864F" opacity="0.46" />
      </Svg>
    </Animated.View>
  );
}

function HeaderRibbon({ topInset }: { topInset: number }) {
  return (
    <View style={[styles.headerArea, { paddingTop: topInset + 10 }]}>
      <View style={styles.ribbon}>
        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 390 118" preserveAspectRatio="none">
          <Path
            d="M0 8 H358 L340 58 L358 110 H0 Q18 58 0 8 Z"
            fill="#F5E8D7"
            stroke="#C5A789"
            strokeWidth="2"
          />
          <Path
            d="M16 20 H332 M16 98 H332"
            stroke="#C5A789"
            strokeWidth="2"
            strokeDasharray="8 8"
            strokeLinecap="round"
          />
          <Path d="M346 32 L330 58 L346 84" fill="none" stroke="#C5A789" strokeWidth="2" />
        </Svg>
        <Text style={styles.ribbonTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>
          Glow Up Plans
        </Text>
        <Text style={styles.ribbonSub} numberOfLines={2}>
          Choose your transformation journey
        </Text>
      </View>
      <Flower small style={styles.headerFlowerA} />
      <Flower small style={styles.headerFlowerB} />
      <Sparkles opacity={0.48} style={styles.headerSparkles} />
    </View>
  );
}

function PlantArt() {
  return (
    <Svg width={96} height={110} viewBox="0 0 132 150">
      <Path d="M28 76 H78 L69 126 H38 Z" fill="#DFA180" stroke="#7B5542" strokeWidth="2" />
      <Ellipse cx="53" cy="77" rx="28" ry="10" fill="#AA775B" stroke="#7B5542" strokeWidth="2" />
      <Path d="M36 84 C50 90 64 88 74 82" fill="none" stroke="#7B5542" strokeWidth="1.2" opacity="0.55" />
      <Path d="M54 76 C52 50 52 35 50 18" fill="none" stroke="#497348" strokeWidth="3" />
      <Path d="M51 38 C36 26 27 30 22 43 C37 47 45 45 51 38 Z" fill="#A8C98B" stroke="#497348" strokeWidth="2" />
      <Path d="M53 48 C72 31 86 37 90 53 C73 57 62 56 53 48 Z" fill="#B7D99D" stroke="#497348" strokeWidth="2" />
      <Path d="M48 24 C62 7 76 10 82 24 C66 31 56 30 48 24 Z" fill="#BEDFA4" stroke="#497348" strokeWidth="2" />
      <Line x1="12" y1="54" x2="23" y2="62" stroke="#7F8E5F" strokeWidth="2" />
      <Path d="M9 50 C15 49 19 52 20 57 C14 58 10 56 9 50 Z" fill="#C5DDAE" stroke="#7F8E5F" />
      <Line x1="92" y1="68" x2="104" y2="61" stroke="#7F8E5F" strokeWidth="2" />
      <Path d="M102 57 C110 56 114 61 113 67 C107 67 102 64 102 57 Z" fill="#C5DDAE" stroke="#7F8E5F" />
      <Circle cx="94" cy="112" r="25" fill="#F5DDE5" stroke="#7B5542" strokeWidth="2" />
      <Circle cx="94" cy="112" r="18" fill="#FFF5EA" stroke="#7B5542" strokeWidth="1.5" />
      <Line x1="94" y1="112" x2="94" y2="100" stroke="#7B5542" strokeWidth="2" />
      <Line x1="94" y1="112" x2="104" y2="112" stroke="#7B5542" strokeWidth="2" />
      <SvgText x="85" y="96" fill="#7B5542" fontSize="8">12</SvgText>
      <SvgText x="86" y="130" fill="#7B5542" fontSize="8">6</SvgText>
      <SvgText x="107" y="116" fill="#7B5542" fontSize="8">3</SvgText>
      <SvgText x="75" y="116" fill="#7B5542" fontSize="8">9</SvgText>
      <SvgText x="101" y="106" fill="#7B5542" fontSize="9">7:00</SvgText>
      <SvgText x="104" y="116" fill="#7B5542" fontSize="8">AM</SvgText>
      <Path d="M75 79 Q84 67 94 79" fill="none" stroke="#7B5542" strokeWidth="2" />
      <Path d="M85 86 Q94 76 104 86" fill="none" stroke="#7B5542" strokeWidth="2" />
    </Svg>
  );
}

function ResetArt() {
  return (
    <Svg width={96} height={124} viewBox="0 0 132 172">
      <Path d="M30 150 C38 113 41 78 40 36" fill="none" stroke="#8D5B65" strokeWidth="4" strokeLinecap="round" />
      <Path d="M40 36 C28 55 17 60 8 61 C12 39 24 21 39 9 C50 24 59 43 64 63 C52 61 45 54 40 36 Z" fill="#F1D3E0" stroke="#8D5B65" strokeWidth="2" />
      <Path d="M39 10 C39 42 39 78 36 113" stroke="#8D5B65" strokeWidth="2" />
      <Path d="M36 34 C46 48 56 57 64 63" stroke="#8D5B65" strokeWidth="2" fill="none" />
      <Rect x="61" y="56" width="54" height="60" rx="3" fill="#F7EAD1" stroke="#8D5B65" strokeWidth="2" />
      <Path d="M61 72 H115" stroke="#8D5B65" strokeWidth="1.5" />
      {[68, 78, 88, 98, 108].map((x) => (
        <Path key={x} d={`M${x} 54 V62`} stroke="#8D5B65" strokeWidth="3" strokeLinecap="round" />
      ))}
      <Path d="M76 91 Q87 104 102 92" stroke="#D0A451" strokeWidth="2" fill="none" />
      <Path d="M87 76 L91 85 L100 86 L93 92 L95 101 L87 96 L79 101 L81 92 L74 86 L83 85 Z" fill="#F2CA61" stroke="#9B7440" />
      <Path d="M76 78 C68 86 70 99 82 105 C66 105 58 89 66 77 C69 72 73 70 76 78 Z" fill="#E7C5D7" stroke="#8D5B65" />
      <Path d="M70 113 Q87 104 109 112" stroke="#8D5B65" strokeWidth="1" strokeDasharray="3 4" />
    </Svg>
  );
}

function ButterflyArt() {
  return (
    <Svg width={108} height={116} viewBox="0 0 160 170">
      <Path d="M22 16 C46 10 58 22 55 49 C35 45 21 35 22 16 Z" fill="#D8E4E5" stroke="#7B5542" strokeWidth="2" />
      <Path d="M15 12 C20 31 20 49 11 65" stroke="#7B5542" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Path d="M72 76 C41 39 55 13 92 23 C95 51 91 70 72 76 Z" fill="#E9CAD8" stroke="#7B5542" strokeWidth="2" />
      <Path d="M77 78 C107 33 143 35 148 69 C128 96 100 101 77 78 Z" fill="#D8BEDB" stroke="#7B5542" strokeWidth="2" />
      <Path d="M70 85 C40 101 38 133 65 146 C80 124 80 103 70 85 Z" fill="#E7B5C5" stroke="#7B5542" strokeWidth="2" />
      <Path d="M78 85 C112 100 128 128 106 149 C82 132 75 108 78 85 Z" fill="#E7CF98" stroke="#7B5542" strokeWidth="2" />
      <Ellipse cx="74" cy="83" rx="8" ry="22" fill="#8B5D65" stroke="#4D3037" strokeWidth="1.5" transform="rotate(-16 74 83)" />
      <Path d="M68 61 C57 53 48 52 41 58" stroke="#4D3037" strokeWidth="2" fill="none" />
      <Path d="M82 60 C91 48 101 45 112 49" stroke="#4D3037" strokeWidth="2" fill="none" />
      {[["54","42"],["96","51"],["58","118"],["107","123"],["125","69"]].map(([x, y]) => (
        <Circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#F4D37A" opacity="0.75" />
      ))}
      <SparklePath x={21} y={96} />
      <SparklePath x={10} y={128} />
      <SparklePath x={127} y={29} />
    </Svg>
  );
}

function SparklePath({ x, y }: { x: number; y: number }) {
  const sparkle = (size: number) =>
    `M${x} ${y - size} L${x + size * 0.34} ${y - size * 0.17} L${x + size * 1.16} ${y + size * 0.17} L${x + size * 0.34} ${y + size * 0.5} L${x} ${y + size * 1.34} L${x - size * 0.34} ${y + size * 0.5} L${x - size * 1.16} ${y + size * 0.17} L${x - size * 0.34} ${y - size * 0.17} Z`;

  return (
    <>
      <Path d={sparkle(22)} fill="#FFF8C8" opacity="0.1" />
      <Path d={sparkle(17)} fill="#FFF1A3" opacity="0.2" />
      <Path d={sparkle(12)} fill="#F1CC63" stroke="#A3793F" strokeWidth="1" />
      <Path d={sparkle(7)} fill="#FFF8CF" opacity="0.26" />
    </>
  );
}

function PlanArt({ type }: { type: "plant" | "reset" | "butterfly" }) {
  if (type === "reset") return <ResetArt />;
  if (type === "butterfly") return <ButterflyArt />;
  return <PlantArt />;
}

function WreathProgress({ percent }: { percent: number }) {
  return (
    <View style={styles.percentWreath}>
      <Svg width={74} height={44} viewBox="0 0 74 44" style={StyleSheet.absoluteFill}>
        <Path d="M22 36 C7 28 7 14 20 5" fill="none" stroke="#8F7A54" strokeWidth="1.5" />
        <Path d="M52 36 C67 28 67 14 54 5" fill="none" stroke="#8F7A54" strokeWidth="1.5" />
        {[0, 1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <Ellipse cx={15 - i * 2} cy={14 + i * 6} rx="2.7" ry="5.4" fill="#E6D7AE" stroke="#8F7A54" strokeWidth="0.7" transform={`rotate(${-42 + i * 8} ${15 - i * 2} ${14 + i * 6})`} />
            <Ellipse cx={59 + i * 2} cy={14 + i * 6} rx="2.7" ry="5.4" fill="#E6D7AE" stroke="#8F7A54" strokeWidth="0.7" transform={`rotate(${42 - i * 8} ${59 + i * 2} ${14 + i * 6})`} />
          </React.Fragment>
        ))}
      </Svg>
      <Text style={styles.percentText}>{percent}%</Text>
    </View>
  );
}

function FloralProgressBar({ percent }: { percent: number }) {
  const flowers = Array.from({ length: 8 });

  return (
    <View style={styles.floralBar}>
      <View style={[styles.floralBarFill, { width: `${Math.max(percent, 6)}%` as `${number}%` }]} />
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

function CardWash({ look }: { look: (typeof PLAN_LOOK)[string] }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={look.wash}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardWash}
      />
      <View style={[styles.washBloom, styles.washBloomWarm]} />
      <View style={[styles.washBloom, styles.washBloomLight]} />
      <View style={[styles.washBloom, styles.washBloomRose]} />
      <View style={styles.paperMist} />
    </View>
  );
}

function PookieEmoji({
  children,
  bottomTravel,
  offset,
  rightTravel,
}: {
  bottomTravel: number;
  children: string;
  offset: number;
  rightTravel: number;
}) {
  const progress = useRef(new Animated.Value(offset)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;
    let movement: Animated.CompositeAnimation | null = null;

    const runMovement = (from: number) => {
      if (!active) return;
      progress.setValue(from);
      movement = Animated.timing(progress, {
        toValue: 1,
        duration: Math.max(1, (1 - from) * 22000),
        easing: Easing.linear,
        useNativeDriver: true,
      });
      movement.start(({ finished }) => {
        if (!finished || !active) return;
        progress.setValue(0);
        runMovement(0);
      });
    };

    runMovement(offset);

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    pulseLoop.start();
    return () => {
      active = false;
      movement?.stop();
      pulseLoop.stop();
    };
  }, [offset, progress, pulse]);

  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.24, 0.43],
  });
  const glowScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.05],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, rightTravel, rightTravel, 0, 0],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 0, bottomTravel, bottomTravel, 0],
  });

  return (
    <Animated.Text
      style={[
        styles.pookie,
        {
          opacity: glowOpacity,
          transform: [{ translateX }, { translateY }, { scale: glowScale }],
        },
      ]}
    >
      {children}
    </Animated.Text>
  );
}

function PookieBorderTrail({
  bottomTravel,
  rightTravel,
}: {
  bottomTravel: number;
  rightTravel: number;
}) {
  return (
    <View pointerEvents="none" style={styles.pookieLayer}>
      <PookieEmoji bottomTravel={bottomTravel} rightTravel={rightTravel} offset={0.04}>🌸</PookieEmoji>
      <PookieEmoji bottomTravel={bottomTravel} rightTravel={rightTravel} offset={0.29}>🎀</PookieEmoji>
      <PookieEmoji bottomTravel={bottomTravel} rightTravel={rightTravel} offset={0.54}>🧸</PookieEmoji>
      <PookieEmoji bottomTravel={bottomTravel} rightTravel={rightTravel} offset={0.79}>🦋</PookieEmoji>
    </View>
  );
}

function PlanCard({
  plan,
  isActive,
  onStart,
  onExpand,
  onDeactivate,
  isExpanded,
}: {
  plan: GlowUpPlan;
  isActive: boolean;
  onStart: () => void;
  onExpand: () => void;
  onDeactivate: () => void;
  isExpanded: boolean;
}) {
  const { t, l } = useLanguage();
  const { isGlowUpTaskDone, toggleGlowUpTask, getCurrentDay } = useApp();
  const look = PLAN_LOOK[plan.id] ?? PLAN_LOOK["7day"];
  const currentDay = getCurrentDay(plan.id);
  const [cardSize, setCardSize] = useState({ height: 0, width: CARD_WIDTH });

  const totalTasksDone = isActive
    ? plan.days.reduce(
        (acc, d) => acc + d.tasks.filter((task) => isGlowUpTaskDone(plan.id, d.day, task.id)).length,
        0,
      )
    : 0;
  const totalTasks = plan.days.reduce((acc, d) => acc + d.tasks.length, 0);
  const progressPercent = totalTasks > 0 ? Math.round((totalTasksDone / totalTasks) * 100) : 0;
  const darkCard = plan.id === "30day";
  const displayTitle = l(plan.title, plan.titleEn);

  return (
    <View style={[styles.cardShell, { backgroundColor: look.shadow }]}>
      <View
        onLayout={(event) => {
          const { height, width } = event.nativeEvent.layout;
          setCardSize((current) => {
            const nextHeight = Math.round(height);
            const nextWidth = Math.round(width);
            if (current.height === nextHeight && current.width === nextWidth) return current;
            return { height: nextHeight, width: nextWidth };
          });
        }}
        style={[styles.planCard, isActive && styles.planCardActive, { backgroundColor: look.bg }]}
      >
        <CardWash look={look} />
        {isActive && (
          <PookieBorderTrail
            bottomTravel={Math.max(cardSize.height, plan.id === "30day" ? 334 : 318)}
            rightTravel={Math.max(cardSize.width, CARD_WIDTH)}
          />
        )}
        <Sparkles
          opacity={plan.id === "7day" ? 0.36 : plan.id === "14day" ? 0.44 : 0.34}
          style={plan.id === "14day" ? styles.cardSparklesRight : styles.cardSparklesLeft}
        />
        {plan.id === "7day" && <Flower small style={styles.cardFlowerBottom} />}
        {plan.id === "30day" && <Flower style={styles.cardFlowerLarge} />}

        {isActive && (
          <>
            <View style={styles.activeRibbon}>
              <Svg style={StyleSheet.absoluteFill} viewBox="0 0 106 42" preserveAspectRatio="none">
                <Path d="M0 4 H104 V38 H0 L16 21 Z" fill="#E7C36E" stroke="#9A7444" strokeWidth="2" />
              </Svg>
              <Text style={styles.activeText}>{t.glowup.activeBadge}</Text>
            </View>
            <Pressable
              accessibilityLabel={t.glowup.cancelProgressTitle}
              onPress={onDeactivate}
              style={styles.cancelProgressButton}
            >
              <Ionicons name="close" size={14} color="#7B4C50" />
            </Pressable>
          </>
        )}

        <View style={[styles.cardContent, isActive && styles.cardContentActive]}>
          <View style={styles.artColumn}>
            <PlanArt type={look.art} />
          </View>
          <View style={[styles.infoColumn, isActive && styles.infoColumnActive]}>
            <View style={styles.copyBlock}>
              <Text style={[styles.duration, darkCard && styles.darkCardText]}>
                {plan.duration} {t.glowup.days}
              </Text>
              <Text
                style={[
                  styles.planTitle,
                  plan.id === "30day" && styles.planTitleLong,
                  darkCard && styles.darkCardText,
                ]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.72}
              >
                {displayTitle}
              </Text>
              <Text style={[styles.tagline, darkCard && styles.darkCardText]}>
                {l(plan.tagline, plan.taglineEn)}
              </Text>
            </View>

            {isActive ? (
              <View style={styles.activeProgressBlock}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.taskCount, darkCard && styles.darkCardText]}>
                    {totalTasksDone} / {totalTasks} {t.glowup.tasks}
                  </Text>
                  <WreathProgress percent={progressPercent} />
                </View>
                <FloralProgressBar percent={progressPercent} />
              </View>
            ) : (
              <Pressable
                style={[
                  styles.startButton,
                  { backgroundColor: look.button },
                  plan.id === "14day" && styles.lightStartButton,
                ]}
                onPress={onStart}
              >
                <Text style={[styles.startText, plan.id === "14day" && styles.lightStartText]}>
                  {t.glowup.startPlan}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {isActive && (
          <View style={styles.activeActions}>
            <Pressable style={styles.viewButton} onPress={onExpand}>
              <Text style={styles.viewText}>{isExpanded ? t.glowup.hideDays : t.glowup.viewTasks}</Text>
              <Ionicons name={isExpanded ? "chevron-up" : "pencil"} size={20} color="#744B45" />
            </Pressable>
          </View>
        )}

        {isActive && isExpanded && (
          <View style={styles.daysList}>
            {plan.days.slice(0, Math.min(currentDay + 1, plan.days.length)).map((d) => {
              const dayDone = d.tasks.filter((task) => isGlowUpTaskDone(plan.id, d.day, task.id)).length;
              const isToday = d.day === currentDay;
              return (
                <View key={d.day} style={[styles.dayItem, isToday && styles.dayItemToday]}>
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayTitle}>
                      {t.glowup.today} {d.day}: {l(d.theme, d.themeEn)}
                    </Text>
                    {isToday && <Text style={styles.todayBadge}>{t.glowup.today}</Text>}
                  </View>
                  {d.tasks.map((task) => {
                    const done = isGlowUpTaskDone(plan.id, d.day, task.id);
                    return (
                      <Pressable
                        key={task.id}
                        style={styles.taskRow}
                        disabled={!isToday}
                        onPress={async () => {
                          if (!isToday) return;
                          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          await toggleGlowUpTask(plan.id, d.day, task.id);
                        }}
                      >
                        <View style={[styles.checkBox, done && styles.checkBoxDone]}>
                          {done && <Text style={styles.checkMark}>✓</Text>}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.taskTitle, done && styles.taskDone]}>
                            {l(task.title, task.titleEn)}
                          </Text>
                          <Text style={styles.taskCat}>{l(task.category, task.categoryEn)}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                  <Text style={styles.dayProgress}>
                    {dayDone} / {d.tasks.length} {t.glowup.completed}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

export default function GlowUpScreen() {
  const insets = useSafeAreaInsets();
  const { data, deactivateGlowUpPlan, startGlowUpPlan } = useApp();
  const { isRTL, t } = useLanguage();
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [cancelPlanId, setCancelPlanId] = useState<string | null>(null);

  const topInset = Platform.OS === "web" ? 40 : insets.top;

  async function handleStart(planId: string) {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await startGlowUpPlan(planId);
    setExpandedPlanId(null);
  }

  function handleDeactivate(planId: string) {
    setCancelPlanId(planId);
  }

  async function confirmDeactivate() {
    if (!cancelPlanId) return;
    const planId = cancelPlanId;
    setCancelPlanId(null);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await deactivateGlowUpPlan(planId);
    setExpandedPlanId((current) => (current === planId ? null : current));
  }

  const activePlanIds =
    data.glowUpProgress.activePlanIds ??
    (data.glowUpProgress.activePlanId ? [data.glowUpProgress.activePlanId] : []);

  return (
    <View style={styles.root}>
      <PaperGrid />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <HeaderRibbon topInset={topInset} />
        <View style={styles.content}>
          {GLOW_UP_PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isActive={activePlanIds.includes(plan.id)}
              isExpanded={expandedPlanId === plan.id}
              onStart={() => handleStart(plan.id)}
              onDeactivate={() => handleDeactivate(plan.id)}
              onExpand={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
            />
          ))}
        </View>
      </ScrollView>
      <Modal
        animationType="fade"
        onRequestClose={() => setCancelPlanId(null)}
        statusBarTranslucent
        transparent
        visible={Boolean(cancelPlanId)}
      >
        <View style={styles.cancelOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setCancelPlanId(null)} />
          <View style={styles.cancelCard}>
            <View style={styles.cancelIcon}>
              <Text style={styles.cancelIconText}>!</Text>
            </View>
            <Text style={[styles.cancelTitle, { textAlign: isRTL ? "right" : "left" }]}>
              {t.glowup.cancelProgressTitle}
            </Text>
            <Text style={[styles.cancelMessage, { textAlign: isRTL ? "right" : "left" }]}>
              {t.glowup.cancelProgressMessage}
            </Text>
            <View style={[styles.cancelActions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Pressable style={styles.cancelKeepButton} onPress={() => setCancelPlanId(null)}>
                <Text style={styles.cancelKeepText}>{t.glowup.cancelProgressKeep}</Text>
              </Pressable>
              <Pressable style={styles.cancelConfirmButton} onPress={confirmDeactivate}>
                <Text style={styles.cancelConfirmText}>{t.glowup.cancelProgressConfirm}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#F7F0DF",
    flex: 1,
  },
  cancelOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "rgba(45, 20, 34, 0.26)",
    justifyContent: "center",
    padding: 24,
  },
  cancelCard: {
    backgroundColor: "#F7D7DF",
    borderColor: "rgba(194, 24, 91, 0.16)",
    borderRadius: 24,
    borderWidth: 1,
    maxWidth: 340,
    padding: 20,
    shadowColor: "#C2185B",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    width: "100%",
    elevation: 18,
  },
  cancelIcon: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.58)",
    borderRadius: 18,
    height: 42,
    justifyContent: "center",
    marginBottom: 14,
    width: 42,
  },
  cancelIconText: {
    color: "#C2185B",
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    lineHeight: 28,
  },
  cancelTitle: {
    color: "#2F2028",
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    lineHeight: 26,
  },
  cancelMessage: {
    color: "rgba(47,32,40,0.72)",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  cancelActions: {
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 18,
  },
  cancelKeepButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.46)",
    borderRadius: 16,
    minWidth: 86,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  cancelConfirmButton: {
    alignItems: "center",
    backgroundColor: "#C2185B",
    borderRadius: 16,
    minWidth: 112,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  cancelKeepText: {
    color: "#6B4A58",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  cancelConfirmText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: Platform.OS === "web" ? 102 : 118,
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
    minHeight: 206,
    paddingHorizontal: 0,
    position: "relative",
  },
  ribbon: {
    alignSelf: "center",
    height: 116,
    justifyContent: "center",
    marginLeft: 0,
    marginRight: 0,
    marginTop: 10,
    paddingLeft: 26,
    paddingRight: 58,
    width: SCREEN_WIDTH - 26,
  },
  ribbonTitle: {
    color: "#5A2A2A",
    fontFamily: "serif",
    fontSize: 35,
    fontWeight: "800",
    lineHeight: 42,
  },
  ribbonSub: {
    color: INK,
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    lineHeight: 22,
    maxWidth: SCREEN_WIDTH - 118,
  },
  headerFlowerA: {
    position: "absolute",
    right: 40,
    top: 82,
  },
  headerFlowerB: {
    position: "absolute",
    right: 16,
    top: 124,
  },
  headerSparkles: {
    position: "absolute",
    right: 18,
    top: 160,
  },
  sparkleWrap: {
    height: 64,
    width: 64,
  },
  sparkleGlow: {
    shadowColor: "#F3C94F",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    gap: 20,
    paddingHorizontal: CARD_INSET,
  },
  cardShell: {
    borderRadius: 20,
    paddingBottom: 6,
    paddingRight: 3,
  },
  planCard: {
    borderColor: "rgba(125, 75, 69, 0.25)",
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 218,
    overflow: "visible",
    padding: 15,
    position: "relative",
    width: CARD_WIDTH,
  },
  cardWash: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    opacity: 0.98,
  },
  washBloom: {
    borderRadius: 999,
    position: "absolute",
  },
  washBloomWarm: {
    backgroundColor: "rgba(255, 246, 204, 0.42)",
    height: 130,
    left: -18,
    top: 18,
    width: 150,
  },
  washBloomLight: {
    backgroundColor: "rgba(255, 250, 241, 0.32)",
    height: 150,
    right: -28,
    top: -34,
    width: 170,
  },
  washBloomRose: {
    backgroundColor: "rgba(180, 88, 108, 0.12)",
    bottom: -32,
    height: 120,
    right: 24,
    width: 190,
  },
  paperMist: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 247, 235, 0.08)",
    borderRadius: 20,
  },
  pookieLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "visible",
    zIndex: 4,
  },
  pookie: {
    fontFamily: "serif",
    fontSize: 16,
    lineHeight: 20,
    left: -9,
    position: "absolute",
    textShadowColor: "rgba(255, 220, 94, 0.9)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 9,
    top: -9,
  },
  planCardActive: {
    minHeight: 318,
  },
  cardContent: {
    flexDirection: "row",
    minHeight: 158,
  },
  cardContentActive: {
    minHeight: 218,
  },
  artColumn: {
    alignItems: "center",
    justifyContent: "center",
    width: ART_WIDTH,
  },
  infoColumn: {
    flex: 1,
    justifyContent: "space-between",
    minWidth: 0,
    paddingLeft: 9,
    paddingRight: 0,
  },
  infoColumnActive: {
    justifyContent: "flex-start",
    paddingTop: 48,
  },
  copyBlock: {
    flexShrink: 1,
  },
  duration: {
    color: INK,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    letterSpacing: 0,
    lineHeight: 19,
    textTransform: "uppercase",
  },
  planTitle: {
    color: INK,
    fontFamily: "Inter_700Bold",
    fontSize: 23,
    lineHeight: 28,
    marginTop: 4,
  },
  planTitleLong: {
    fontSize: 20,
    lineHeight: 25,
  },
  tagline: {
    color: "#2E181A",
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 5,
  },
  darkCardText: {
    color: "#210D10",
  },
  startButton: {
    alignItems: "center",
    borderColor: "rgba(95, 35, 45, 0.28)",
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignSelf: "stretch",
    marginTop: 12,
    minHeight: 46,
    paddingHorizontal: 10,
    shadowColor: "#5F202C",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 2,
  },
  startText: {
    color: "#FFF8F7",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    lineHeight: 20,
    textAlign: "center",
  },
  lightStartButton: {
    borderColor: "rgba(126, 83, 68, 0.2)",
    shadowOpacity: 0.08,
  },
  lightStartText: {
    color: "#7A4D52",
  },
  activeRibbon: {
    height: 40,
    position: "absolute",
    right: -8,
    top: 38,
    width: 108,
    zIndex: 5,
  },
  activeText: {
    color: "#452822",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    lineHeight: 38,
    marginLeft: 32,
  },
  cancelProgressButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 247, 235, 0.86)",
    borderColor: "rgba(116, 75, 69, 0.24)",
    borderRadius: 999,
    borderWidth: 1,
    height: 24,
    justifyContent: "center",
    position: "absolute",
    right: 104,
    top: 46,
    width: 24,
    zIndex: 6,
  },
  activeProgressBlock: {
    marginTop: 12,
    width: "100%",
  },
  progressHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minWidth: 0,
  },
  taskCount: {
    color: INK,
    fontFamily: "Inter_500Medium",
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  percentWreath: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    marginLeft: 8,
    width: 74,
  },
  percentText: {
    color: INK,
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    lineHeight: 21,
    minWidth: 34,
    textAlign: "center",
  },
  floralBar: {
    alignItems: "center",
    backgroundColor: "rgba(158, 87, 105, 0.35)",
    borderRadius: 8,
    height: 11,
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 8,
    overflow: "hidden",
    width: "76%",
  },
  floralBarFill: {
    backgroundColor: "rgba(158, 87, 105, 0.55)",
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
  },
  floralFlowers: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
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
    opacity: 0.8,
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
  viewButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 247, 235, 0.88)",
    borderColor: "rgba(126, 83, 68, 0.18)",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    height: 52,
    justifyContent: "center",
  },
  viewText: {
    color: "#3C1D1D",
    fontFamily: "Inter_500Medium",
    fontSize: 17,
    lineHeight: 22,
  },
  activeActions: {
    marginTop: 14,
  },
  cardSparklesLeft: {
    left: Math.max(106, ART_WIDTH + 20),
    position: "absolute",
    top: 36,
    zIndex: 2,
  },
  cardSparklesRight: {
    position: "absolute",
    right: 22,
    top: -8,
    zIndex: 2,
  },
  cardFlowerBottom: {
    bottom: -14,
    left: -14,
    position: "absolute",
  },
  cardFlowerLarge: {
    bottom: -12,
    right: 10,
    position: "absolute",
  },
  daysList: {
    gap: 10,
    marginTop: 12,
  },
  dayItem: {
    backgroundColor: "rgba(255, 247, 235, 0.72)",
    borderColor: "rgba(126, 83, 68, 0.18)",
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
  },
  dayItemToday: {
    backgroundColor: "rgba(255, 238, 244, 0.92)",
  },
  dayHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  dayTitle: {
    color: INK,
    flex: 1,
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  todayBadge: {
    backgroundColor: ROSE,
    borderRadius: 10,
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  taskRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
    paddingVertical: 5,
  },
  checkBox: {
    alignItems: "center",
    borderColor: "#B78B91",
    borderRadius: 6,
    borderWidth: 2,
    height: 19,
    justifyContent: "center",
    marginTop: 2,
    width: 19,
  },
  checkBoxDone: {
    backgroundColor: ROSE,
    borderColor: ROSE,
  },
  checkMark: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    lineHeight: 15,
  },
  taskTitle: {
    color: "#321819",
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    lineHeight: 16,
  },
  taskDone: {
    color: "#8B7274",
    textDecorationLine: "line-through",
  },
  taskCat: {
    color: "#8F7776",
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    marginTop: 1,
  },
  dayProgress: {
    color: "#8F7776",
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    marginTop: 4,
    textAlign: "right",
  },
});
