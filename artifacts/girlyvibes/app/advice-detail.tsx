import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  I18nManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { ADVICE_CATEGORIES } from "@/data/advice";
import { useColors } from "@/hooks/useColors";

export default function AdviceDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const { isFavorite, toggleFavoriteAdvice } = useApp();

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
  const isRTL = I18nManager.isRTL;

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
            {category?.title}
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
        <Text style={[styles.title, { color: colors.foreground }]}>
          {card.title}
        </Text>
        <View style={styles.metaRow}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={14}
            color={colors.mutedForeground}
          />
          <Text style={[styles.readTime, { color: colors.mutedForeground }]}>
            {card.readTime} read
          </Text>
        </View>
        <View
          style={[styles.divider, { backgroundColor: colors.border }]}
        />
        <Text style={[styles.body, { color: colors.foreground }]}>
          {card.content}
        </Text>

        <View
          style={[styles.quoteBox, { backgroundColor: colors.card, borderColor: colors.primary }]}
        >
          <MaterialCommunityIcons
            name="star-four-points"
            size={16}
            color={colors.primary}
          />
          <Text style={[styles.quoteText, { color: colors.foreground }]}>
            {card.preview}
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
