/**
 * Modal · components/ui
 *
 * Legacy Modal wrapper — artık BottomSheet bileşenini kullanır.
 * Geriye dönük uyumluluk sağlar, mevcut Modal kullanıcıları
 * aynı API ile çalışmaya devam eder.
 * Çarpı yok — tutamaçtan sürükleyerek veya dışarı tıklayarak kapanır.
 */

import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Spacing } from "../../styles";
import { BottomSheet } from "./BottomSheet";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  maxHeight?: number;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  maxHeight,
}) => {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      maxHeight={maxHeight}
      heightPercent={maxHeight ? undefined : 0.7}
    >
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {children}
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.xl,
  },
});

export default Modal;
