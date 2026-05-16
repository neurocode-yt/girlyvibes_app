import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

const EMOJIS = ["😊", "🥰", "🧸", "🎀", "💖", "✨", "🌸", "🥺", "🫶"];

interface Particle {
  id: number;
  emoji: string;
  left: string;
  size: number;
  progress: Animated.Value;
  duration: number;
  startX: number;
  endX: number;
}

export function FloatingEmojis() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const idCounter = useRef(0);

  useEffect(() => {
    // Spawn an emoji every 600ms
    const interval = setInterval(() => {
      const id = idCounter.current++;

      const particle: Particle = {
        id,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        left: `${10 + Math.random() * 80}%`, // Stay within 10% - 90% horizontal bounds
        size: 16 + Math.random() * 10, // 16 to 26
        progress: new Animated.Value(0),
        duration: 2500 + Math.random() * 1500, // 2.5s to 4s
        startX: (Math.random() - 0.5) * 10, // Slight horizontal drift
        endX: (Math.random() - 0.5) * 30,
      };

      setParticles((prev) => [...prev.slice(-12), particle]); // Max 12 emojis on screen

      Animated.timing(particle.progress, {
        toValue: 1,
        duration: particle.duration,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setParticles((prev) => prev.filter((p) => p.id !== id));
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => {
        const translateY = p.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [20, -90], // Start slightly below bottom, float past top
        });
        const translateX = p.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [p.startX, p.endX],
        });
        const opacity = p.progress.interpolate({
          inputRange: [0, 0.2, 0.8, 1],
          outputRange: [0, 0.8, 0.8, 0],
        });
        const rotate = p.progress.interpolate({
          inputRange: [0, 1],
          outputRange: ["-10deg", "10deg"],
        });

        return (
          <Animated.Text
            key={p.id}
            style={[
              styles.emoji,
              {
                left: p.left as any,
                fontSize: p.size,
                opacity,
                transform: [{ translateY }, { translateX }, { rotate }],
              },
            ]}
          >
            {p.emoji}
          </Animated.Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  emoji: {
    position: "absolute",
    bottom: -10, // Start just at/below the bottom edge of the card
    textShadowColor: "rgba(255, 184, 219, 0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
