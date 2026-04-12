import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { ADVICE_CATEGORIES, type AdviceCard } from "@/data/advice";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";

function AdviceCardItem({ card }: { card: AdviceCard }) {
  const colors = useColors();
  const router = useRouter();
  const { isFavorite, toggleFavoriteAdvice } = useApp();
  const { l } = useLanguage();

  const fav = isFavorite(card.id);
  const category = ADVICE_CATEGORIES.find((c) => c.id === card.category);

  return (
    <Pressable
      style={[
        styles.adviceCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={() => {
        Haptics.selectionAsync();
        router.push({ pathname: "/advice-detail", params: { cardId: card.id } });
      }}
    >
      <View style={styles.adviceCardTop}>
        <View
          style={[styles.catPill, { backgroundColor: category?.color ?? colors.highlight }]}
        >
          <Text style={[styles.catPillText, { color: colors.primary }]}>
            {category ? l(category.title, category.titleEn) : ""}
          </Text>
        </View>
        <Pressable
          onPress={async (e) => {
            e.stopPropagation?.();
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await toggleFavoriteAdvice(card.id);
          }}
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name={fav ? "heart" : "heart-outline"}
            size={20}
            color={fav ? colors.primary : colors.mutedForeground}
          />
        </Pressable>
      </View>
      <Text style={[styles.cardTitle, { color: colors.foreground }]}>
        {l(card.title, card.titleEn)}
      </Text>
      <Text style={[styles.cardPreview, { color: colors.mutedForeground }]}>
        {l(card.preview, card.previewEn)}
      </Text>
      <View style={styles.readRow}>
        <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
        <Text style={[styles.readTime, { color: colors.mutedForeground }]}>
          {l(card.readTime, card.readTimeEn)}
        </Text>
      </View>
    </Pressable>
  );
}

export default function AdviceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, l } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const allCards = ADVICE_CATEGORIES.flatMap((c) => c.cards);
  const filtered =
    selectedCategory === "all"
      ? allCards
      : allCards.filter((c) => c.category === selectedCategory);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.card, colors.background]}
        style={[styles.header, { paddingTop: topInset + 16 }]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {t.advice.screenTitle}
        </Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          {t.advice.screenSubtitle}
        </Text>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
          style={{ marginTop: 16 }}
        >
          <Pressable
            style={[
              styles.pill,
              {
                backgroundColor:
                  selectedCategory === "all" ? colors.primary : colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setSelectedCategory("all")}
          >
            <Text
              style={[
                styles.pillText,
                {
                  color:
                    selectedCategory === "all" ? "#fff" : colors.foreground,
                },
              ]}
            >
              {t.advice.all}
            </Text>
          </Pressable>
          {ADVICE_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              style={[
                styles.pill,
                {
                  backgroundColor:
                    selectedCategory === cat.id ? colors.primary : colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text
                style={[
                  styles.pillText,
                  {
                    color:
                      selectedCategory === cat.id ? "#fff" : colors.foreground,
                  },
                ]}
              >
                {l(cat.title, cat.titleEn)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </LinearGradient>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AdviceCardItem card={item} />}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: Platform.OS === "web" ? 100 : 120,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  headerSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  pillsRow: {
    gap: 8,
    paddingRight: 16,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  adviceCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  adviceCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  catPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  catPillText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
  },
  cardPreview: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 12,
  },
  readRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readTime: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
