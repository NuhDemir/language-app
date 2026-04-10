/**
 * BottomSheet · components/ui
 *
 * Uygulama genelinde kullanılan, animasyonlu, sürüklenebilir (draggable)
 * alt panel bileşeni. Tüm modal yerine BottomSheet kullanılır.
 *
 * Kapatma yöntemleri:
 *  1. Tutamaçtan (drag handle) aşağı sürükleyerek
 *  2. Sheet içinde herhangi bir yere aşağı kaydırarak
 *  3. Backdrop'a (boş alana) tıklayarak
 *  4. Android geri butonu (onRequestClose)
 *
 * Çarpı (X) butonu YOK — sadece tutamaç ile sürüklenerek kapanır.
 */

import React, { useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  PanResponder,
  Modal,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Theme, Typography, Spacing, Radius } from "../../styles";

// ─── Constants ────────────────────────────────────────────────────────────────

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DEFAULT_SHEET_HEIGHT = SCREEN_HEIGHT * 0.88;
const DRAG_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 0.5;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BottomSheetProps {
  /** BottomSheet görünürlüğü */
  visible: boolean;
  /** Kapatma callback'i */
  onClose: () => void;
  /** Opsiyonel başlık */
  title?: string;
  /** Başlıkta gösterilecek opsiyonel sayı badge'i */
  count?: number;
  /** Sheet max yüksekliği (px cinsinden) */
  maxHeight?: number;
  /** Sheet'in ekranın yüzde kaçını kaplayacağı (0-1 arası). maxHeight'a göre önceliklidir. */
  heightPercent?: number;
  /** İçerik */
  children: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

const BottomSheetComponent: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  count,
  maxHeight,
  heightPercent,
  children,
}) => {
  // Gerçek sheet yüksekliği
  const sheetHeight = heightPercent
    ? SCREEN_HEIGHT * heightPercent
    : (maxHeight ?? DEFAULT_SHEET_HEIGHT);

  const translateY = useRef(new Animated.Value(sheetHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // İçerideki ScrollView'ların en üstte olup olmadığını takip etmek için
  const isScrolledToTop = useRef(true);

  // ─── Animasyonlar ──────────────────────────────────────────────────

  const openSheet = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 180,
        mass: 0.8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, backdropOpacity]);

  const closeSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: sheetHeight,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  }, [translateY, backdropOpacity, sheetHeight, onClose]);

  useEffect(() => {
    if (visible) {
      translateY.setValue(sheetHeight);
      backdropOpacity.setValue(0);
      openSheet();
    }
  }, [visible, openSheet, translateY, backdropOpacity, sheetHeight]);

  // ─── Sheet Geneli Pan Responder ────────────────────────────────────
  // Sheet'in herhangi bir yerine aşağı kaydırınca kapanır.
  // Eğer içeride bir ScrollView varsa ve kullanıcı yukarı kaydırıyorsa
  // hareketi ScrollView'a bırakır.

  const sheetPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const isSwipingDown = gestureState.dy > 5;
        const isMoreVertical =
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx);

        // Sadece aşağı kaydırma + dikey hareket + scroll en üstteyse yakala
        return isSwipingDown && isMoreVertical && isScrolledToTop.current;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
          const progress = Math.max(0, 1 - gestureState.dy / sheetHeight);
          backdropOpacity.setValue(progress);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (
          gestureState.dy > DRAG_THRESHOLD ||
          gestureState.vy > VELOCITY_THRESHOLD
        ) {
          closeSheet();
        } else {
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              damping: 22,
              stiffness: 180,
            }),
            Animated.timing(backdropOpacity, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    }),
  ).current;

  // ─── Drag Handle Pan Responder ─────────────────────────────────────
  // Tutamaç her zaman sürüklemeyi yakalar (scroll durumundan bağımsız)

  const dragHandlePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dy) > 5 &&
          Math.abs(gestureState.dx) < Math.abs(gestureState.dy)
        );
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
          const progress = Math.max(0, 1 - gestureState.dy / sheetHeight);
          backdropOpacity.setValue(progress);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (
          gestureState.dy > DRAG_THRESHOLD ||
          gestureState.vy > VELOCITY_THRESHOLD
        ) {
          closeSheet();
        } else {
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              damping: 22,
              stiffness: 180,
            }),
            Animated.timing(backdropOpacity, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    }),
  ).current;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeSheet}
    >
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* ── Backdrop — boş alana tıklayınca kapanır ── */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
        </Animated.View>

        {/* ── Sheet — tüm sheet aşağı kaydırmayı dinler ── */}
        <Animated.View
          style={[
            styles.sheet,
            { maxHeight: sheetHeight, transform: [{ translateY }] },
          ]}
          {...sheetPanResponder.panHandlers}
        >
          {/* Drag Handle & Header */}
          <View
            {...dragHandlePanResponder.panHandlers}
            style={styles.dragContainer}
          >
            <View style={styles.handleRow}>
              <View style={styles.handle} />
            </View>

            {/* Header */}
            {title && (
              <View style={styles.header}>
                <Text style={styles.headerTitle}>{title}</Text>
                {count !== undefined && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{count}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Content */}
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export const BottomSheet = React.memo(BottomSheetComponent);
export default BottomSheet;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },

  sheet: {
    backgroundColor: Theme.background.paper,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: { elevation: 16 },
    }),
  },

  dragContainer: {
    backgroundColor: "transparent",
    width: "100%",
  },

  handleRow: {
    alignItems: "center",
    paddingTop: Spacing.m,
    paddingBottom: Spacing.s,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: Theme.border.subtle,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.l,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.m,
    gap: Spacing.s,
  },
  headerTitle: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.h2,
    lineHeight: Typography.lineHeight.h2,
    color: Theme.text.primary,
  },
  countBadge: {
    backgroundColor: Theme.background.app,
    paddingHorizontal: Spacing.s,
    paddingVertical: 3,
    borderRadius: Radius.circle,
  },
  countText: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.captionSmall,
    lineHeight: Typography.lineHeight.captionSmall,
    color: Theme.primary.main,
  },
});
