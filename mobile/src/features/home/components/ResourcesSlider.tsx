import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Theme, Spacing, Typography } from "../../../styles";
import { ResourceItem } from "./ResourceItem";

interface Resource {
  id: string;
  type: "book" | "article" | "video" | "official_doc";
  title: string;
  description: string;
  provider: string;
  estimated_minutes: number;
}

interface ResourcesSliderProps {
  resources: Resource[];
  isLoading?: boolean;
  error?: string | null;
}

export const ResourcesSlider: React.FC<ResourcesSliderProps> = ({
  resources,
  isLoading = false,
  error = null,
}) => {
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Kaynaklar yükleniyor...</Text>
      </View>
    );
  }

  if (resources.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Henüz kaynak bulunmuyor</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Kaynaklar</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {resources.map((resource) => (
          <ResourceItem key={resource.id} resource={resource} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.l,
  },
  sectionTitle: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.h3,
    color: Theme.text.primary,
    marginBottom: Spacing.m,
    paddingHorizontal: Spacing.l,
  },
  scrollContent: {
    paddingHorizontal: Spacing.l,
    paddingBottom: Spacing.m,
    paddingTop: Spacing.xs,
  },
  errorContainer: {
    padding: Spacing.l,
    alignItems: "center",
  },
  errorText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.bodySmall,
    color: Theme.error.main,
  },
  loadingContainer: {
    padding: Spacing.l,
    alignItems: "center",
  },
  loadingText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.bodySmall,
    color: Theme.text.secondary,
  },
  emptyContainer: {
    padding: Spacing.l,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.bodySmall,
    color: Theme.text.disabled,
  },
});
