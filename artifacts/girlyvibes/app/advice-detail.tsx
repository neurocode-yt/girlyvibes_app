import { AppMaterialCommunityIcons as MaterialCommunityIcons } from "@/components/Icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  StyleProp,
  Text,
  TextStyle,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { ADVICE_CATEGORIES } from "@/data/advice";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightedText({
  query,
  style,
  text,
}: {
  query?: string;
  style: StyleProp<TextStyle>;
  text: string;
}) {
  const cleanQuery = query?.trim();
  if (!cleanQuery) {
    return <Text style={style}>{text}</Text>;
  }

  const parts = text.split(new RegExp(`(${escapeRegExp(cleanQuery)})`, "gi"));
  const lowerQuery = cleanQuery.toLocaleLowerCase();

  return (
    <Text style={style}>
      {parts.map((part, index) =>
        part.toLocaleLowerCase() === lowerQuery ? (
          <Text key={`${part}-${index}`} style={styles.highlightedWord}>
            {part}
          </Text>
        ) : (
          <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
        ),
      )}
    </Text>
  );
}

export default function AdviceDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cardId, highlight } = useLocalSearchParams<{ cardId: string; highlight?: string }>();
  const { isFavorite, toggleFavoriteAdvice } = useApp();
  const { l, isRTL } = useLanguage();

  const allCards = ADVICE_CATEGORIES.flatMap((c) => c.cards);
  const card = allCards.find((c) => c.id === cardId);
  const category = card
    ? ADVICE_CATEGORIES.find((cat) => cat.id === card.category)
    : null;

  if (!card) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Not found</Text>
      </View>
    );
  }

  const fav = isFavorite(card.id);
  const highlightedQuery = Array.isArray(highlight) ? highlight[0] : highlight;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.navBar,
          {
            paddingTop: insets.top + 8,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
            flexDirection: isRTL ? "row-reverse" : "row",
          },
        ]}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MaterialCommunityIcons
            name={isRTL ? "arrow-right" : "arrow-left"}
            size={24}
            color={colors.foreground}
          />
        </Pressable>
        <View
          style={[styles.catBadge, { backgroundColor: category?.color ?? colors.highlight }]}
        >
          <Text style={[styles.catBadgeText, { color: colors.primary }]}>
            {category ? l(category.title, category.titleEn) : ""}
          </Text>
        </View>
        <Pressable
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await toggleFavoriteAdvice(card.id);
          }}
          hitSlop={12}
        >
          <MaterialCommunityIcons
            name={fav ? "heart" : "heart-outline"}
            size={24}
            color={fav ? colors.primary : colors.mutedForeground}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <HighlightedText
          text={l(card.title, card.titleEn)}
          query={highlightedQuery}
          style={[styles.title, { color: colors.foreground }]}
        />
        <View style={styles.metaRow}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={14}
            color={colors.mutedForeground}
          />
          <Text style={[styles.readTime, { color: colors.mutedForeground }]}>
            {l(card.readTime, card.readTimeEn)}
          </Text>
        </View>
        <View
          style={[styles.divider, { backgroundColor: colors.border }]}
        />
        <HighlightedText
          text={l(card.content, card.contentEn)}
          query={highlightedQuery}
          style={[styles.body, { color: colors.foreground }]}
        />

        <View
          style={[styles.quoteBox, { backgroundColor: colors.card, borderColor: colors.primary }]}
        >
          <MaterialCommunityIcons
            name="notebook-outline"
            size={16}
            color={colors.primary}
          />
          <Text style={[styles.quoteText, { color: colors.foreground }]}>
            {l(card.preview, card.previewEn)}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  catBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  catBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    lineHeight: 34,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 20,
  },
  readTime: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  divider: {
    height: 1,
    marginBottom: 20,
  },
  body: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    lineHeight: 26,
    marginBottom: 28,
  },
  highlightedWord: {
    backgroundColor: "#FFE18A",
    borderRadius: 4,
    color: "#5A2A2A",
    fontFamily: "Inter_700Bold",
  },
  quoteBox: {
    padding: 16,
    borderRadius: 14,
    borderLeftWidth: 3,
    gap: 8,
  },
  quoteText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    lineHeight: 22,
    fontStyle: "italic",
  },
});
