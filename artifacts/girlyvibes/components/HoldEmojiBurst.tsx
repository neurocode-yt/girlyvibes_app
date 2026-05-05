import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  GestureResponderEvent,
  StyleSheet,
  View,
} from "react-native";

const HOLD_DELAY_MS = 330;
const EMIT_INTERVAL_MS = 95;
const MOVE_CANCEL_DISTANCE = 14;
const MAX_PARTICLES = 42;
const EMOJIS = ["🌸", "🎀", "💗", "✨", "🦋", "🌷", "💖", "⭐"];

interface Particle {
  id: number;
  emoji: string;
  fontSize: number;
  opacity: Animated.AnimatedInterpolation<number>;
  rotate: Animated.AnimatedInterpolation<string>;
  scale: Animated.AnimatedInterpolation<number>;
  translateX: Animated.AnimatedInterpolation<number>;
  translateY: Animated.AnimatedInterpolation<number>;
}

function pickEmoji() {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

function getTouch(event: GestureResponderEvent) {
  const touch = event.nativeEvent;
  return { x: touch.pageX, y: touch.pageY };
}

export function HoldEmojiBurst({ children }: { children: React.ReactNode }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emitTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fingerX = useRef(new Animated.Value(0)).current;
  const fingerY = useRef(new Animated.Value(0)).current;
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchRef = useRef({ x: 0, y: 0 });
  const followRef = useRef<Animated.CompositeAnimation | null>(null);
  const idRef = useRef(0);
  const holdingRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (emitTimerRef.current) {
      clearInterval(emitTimerRef.current);
      emitTimerRef.current = null;
    }
    followRef.current?.stop();
    followRef.current = null;
    holdingRef.current = false;
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const spawnParticle = useCallback(() => {
    const id = idRef.current++;
    const progress = new Animated.Value(0);
    const angle = Math.random() * Math.PI * 2;
    const endAngle = angle + Math.PI * (0.85 + Math.random() * 0.7);
    const startRadius = 18 + Math.random() * 8;
    const endRadius = 36 + Math.random() * 30;
    const startX = Math.cos(angle) * startRadius;
    const startY = Math.sin(angle) * startRadius;
    const endX = Math.cos(endAngle) * endRadius;
    const endY = Math.sin(endAngle) * endRadius;
    const spin = Math.random() > 0.5 ? "28deg" : "-28deg";
    const duration = 760 + Math.random() * 240;

    const particle: Particle = {
      id,
      emoji: pickEmoji(),
      fontSize: 13 + Math.random() * 6,
      opacity: progress.interpolate({
        inputRange: [0, 0.18, 0.78, 1],
        outputRange: [0, 0.78, 0.68, 0],
      }),
      rotate: progress.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", spin],
      }),
      scale: progress.interpolate({
        inputRange: [0, 0.2, 1],
        outputRange: [0.62, 1, 0.78],
      }),
      translateX: progress.interpolate({
        inputRange: [0, 1],
        outputRange: [startX, endX],
      }),
      translateY: progress.interpolate({
        inputRange: [0, 1],
        outputRange: [startY, endY],
      }),
    };

    setParticles((current) => [...current.slice(-MAX_PARTICLES + 1), particle]);

    Animated.timing(progress, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setParticles((current) => current.filter((item) => item.id !== id));
    });
  }, []);

  const startHold = useCallback(() => {
    if (holdingRef.current) return;
    holdingRef.current = true;
    spawnParticle();
    spawnParticle();
    spawnParticle();
    emitTimerRef.current = setInterval(() => {
      spawnParticle();
      spawnParticle();
    }, EMIT_INTERVAL_MS);
  }, [spawnParticle]);

  const moveFollower = useCallback(
    (touch: { x: number; y: number }, immediate = false) => {
      followRef.current?.stop();

      if (immediate || !holdingRef.current) {
        fingerX.setValue(touch.x);
        fingerY.setValue(touch.y);
        return;
      }

      const dx = touch.x - touchRef.current.x;
      const dy = touch.y - touchRef.current.y;
      const distance = Math.hypot(dx, dy);
      const duration = Math.min(260, Math.max(120, distance * 2.2));

      followRef.current = Animated.parallel([
        Animated.timing(fingerX, {
          toValue: touch.x,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fingerY, {
          toValue: touch.y,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);
      followRef.current.start();
    },
    [fingerX, fingerY],
  );

  const handleTouchStart = useCallback(
    (event: GestureResponderEvent) => {
      const touch = getTouch(event);
      touchStartRef.current = touch;
      touchRef.current = touch;
      clearTimers();
      moveFollower(touch, true);
      holdTimerRef.current = setTimeout(startHold, HOLD_DELAY_MS);
    },
    [clearTimers, moveFollower, startHold],
  );

  const handleTouchMove = useCallback(
    (event: GestureResponderEvent) => {
      const touch = getTouch(event);
      if (holdingRef.current) {
        moveFollower(touch);
        touchRef.current = touch;
        return;
      }

      touchRef.current = touch;
      const dx = touch.x - touchStartRef.current.x;
      const dy = touch.y - touchStartRef.current.y;
      if (Math.hypot(dx, dy) > MOVE_CANCEL_DISTANCE) {
        clearTimers();
      } else {
        moveFollower(touch, true);
      }
    },
    [clearTimers, moveFollower],
  );

  const shouldTrackHeldMove = useCallback(() => holdingRef.current, []);

  return (
    <View
      onMoveShouldSetResponderCapture={shouldTrackHeldMove}
      onResponderMove={handleTouchMove}
      onResponderRelease={clearTimers}
      onResponderTerminate={clearTimers}
      onResponderTerminationRequest={() => true}
      onTouchCancel={clearTimers}
      onTouchEnd={clearTimers}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      style={styles.root}
    >
      {children}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {particles.map((particle) => (
          <Animated.Text
            key={particle.id}
            style={[
              styles.particle,
              {
                fontSize: particle.fontSize,
                left: -10,
                opacity: particle.opacity,
                top: -10,
                transform: [
                  { translateX: Animated.add(fingerX, particle.translateX) },
                  { translateY: Animated.add(fingerY, particle.translateY) },
                  { rotate: particle.rotate },
                  { scale: particle.scale },
                ],
              },
            ]}
          >
            {particle.emoji}
          </Animated.Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  particle: {
    position: "absolute",
    textShadowColor: "rgba(255, 184, 219, 0.85)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
