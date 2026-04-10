import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Theme,
  Spacing,
  Typography,
  Radius,
  Shadows,
  Palette,
} from "../../../styles";

interface Resource {
  id: string;
  type: "book" | "article" | "video" | "official_doc";
  title: string;
  description: string;
  provider: string;
  estimated_minutes: number;
}

interface ResourceItemProps {
  resource: Resource;
}

const getTypeIcon = (type: Resource["type"]) => {
  switch (type) {
    case "book":
      return "book";
    case "article":
      return "document-text";
    case "video":
      return "play-circle";
    case "official_doc":
      return "document";
    default:
      return "document";
  }
};

export const ResourceItem: React.FC<ResourceItemProps> = ({ resource }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={getTypeIcon(resource.type)}
          size={24}
          color={Palette.textBlack}
        />
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {resource.title}
      </Text>

      <Text style={styles.description} numberOfLines={3}>
        {resource.description}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.provider} numberOfLines={1}>
          {resource.provider}
        </Text>
        <Text style={styles.duration}>{resource.estimated_minutes} dk</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: Theme.background.paper,
    borderRadius: Radius.xl,
    padding: Spacing.l,
    marginRight: Spacing.m,
    ...Shadows.small,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.m,
    backgroundColor: Theme.background.app,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.m,
  },
  title: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.bodyMedium,
    color: Theme.text.primary,
    marginBottom: Spacing.xs,
  },
  description: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.bodySmall,
    color: Theme.text.secondary,
    marginBottom: Spacing.m,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  provider: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.captionSmall,
    color: Theme.text.disabled,
    flex: 1,
    marginRight: Spacing.xs,
  },
  duration: {
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.captionSmall,
    color: Theme.primary.main,
  },
});
