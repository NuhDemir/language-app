// src/features/courses/components/MapScreen.tsx
// Main learning map screen with gamified level nodes

import React, { useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';

import { COLORS, SPACING, FONT_SIZES } from '../../../constants/theme';
import { AppText } from '../../../components/ui';
import { useCourseHierarchy } from '../api';
import { useCourseStore } from '../stores';
import { MapItem, LevelNode as LevelNodeType } from '../types';

import { LevelNode } from './LevelNode';
import { UnitHeader } from './UnitHeader';
import { PathConnector } from './PathConnector';
import { MapSkeleton } from './MapSkeleton';

interface MapScreenProps {
  courseId: number;
}

export const MapScreen: React.FC<MapScreenProps> = ({ courseId }) => {
  const router = useRouter();
  const { mapItems, isLoading, isError, refetch, courseTitle } = useCourseHierarchy(courseId);
  const setCurrentLevel = useCourseStore((s) => s.setCurrentLevel);

  // Handle level press
  const handleLevelPress = useCallback((levelId: string, status: string) => {
    if (status === 'locked') {
      Toast.show({
        type: 'info',
        text1: 'Ders Kilitli ',
        text2: 'Önce önceki dersleri tamamlayın',
        position: 'bottom',
      });
      return;
    }

    const id = parseInt(levelId);
    setCurrentLevel(id);

    // Navigate to lesson (will be implemented in Faz 3)
    // router.push(`/(app)/lesson/${levelId}`);

    Toast.show({
      type: 'success',
      text1: 'Derse Başla! ',
      text2: `Seviye ${levelId} seçildi`,
      position: 'bottom',
    });
  }, [setCurrentLevel]);

  // Render map item (unit header or level node)
  const renderItem: ListRenderItem<MapItem> = useCallback(({ item, index }) => {
    if (item.type === 'unit') {
      return (
        <UnitHeader
          title={item.data.title}
          orderIndex={item.data.order_index}
          levelCount={item.data.levels.length}
        />
      );
    }

    // It's a level node
    const levelData = item.data;

    // Find previous level for path connector
    const prevItem = index > 0 ? mapItems[index - 1] : null;
    const showPath = prevItem && prevItem.type === 'level';
    const prevLevel = showPath ? (prevItem as { type: 'level'; data: LevelNodeType }).data : null;

    return (
      <View>
        {/* Path Connector */}
        {showPath && prevLevel && (
          <PathConnector
            fromPosition={prevLevel.position}
            toPosition={levelData.position}
            status={levelData.status}
          />
        )}

        {/* Level Node */}
        <LevelNode
          id={levelData.id}
          orderIndex={levelData.order_index}
          status={levelData.status}
          position={levelData.position}
          totalLessons={levelData.total_lessons}
          onPress={(id) => handleLevelPress(id, levelData.status)}
        />
      </View>
    );
  }, [mapItems, handleLevelPress]);

  // Key extractor for FlatList
  const keyExtractor = useCallback((item: MapItem, index: number) => {
    if (item.type === 'unit') {
      return `unit-${item.data.id}`;
    }
    return `level-${item.data.id}-${index}`;
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <AppText style={styles.headerTitle}>Yükleniyor...</AppText>
        </View>
        <MapSkeleton />
      </SafeAreaView>
    );
  }

  // Error state
  if (isError) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <AppText style={styles.errorEmoji}>😔</AppText>
          <AppText style={styles.errorTitle}>Bir Hata Oluştu</AppText>
          <AppText style={styles.errorText}>
            Müfredat yüklenirken bir sorun oluştu
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (mapItems.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <AppText style={styles.errorEmoji}>📚</AppText>
          <AppText style={styles.errorTitle}>Henüz İçerik Yok</AppText>
          <AppText style={styles.errorText}>
            Bu kurs için henüz ders eklenmemiş
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <AppText style={styles.headerTitle}>{courseTitle || 'Öğrenme Yolu'}</AppText>
      </View>

      {/* Map */}
      <FlatList
        data={mapItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refetch}
            tintColor={COLORS.primary.main}
          />
        }
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={7}
        initialNumToRender={10}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.bg,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
    backgroundColor: COLORS.neutral.bg,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.neutral.title,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  errorTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.neutral.title,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.neutral.body,
    textAlign: 'center',
  },
});
