/**
 * MarkdownText Component
 * Renders markdown text with proper styling
 * Single Responsibility: Render markdown segments as React Native Text
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Only renders markdown, parsing is delegated
 * - Open/Closed: Easy to extend with new styles
 * - Dependency Inversion: Depends on markdown parser abstraction
 */

import React, { useMemo } from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { parseMarkdown, type MarkdownSegment } from '../../utils/markdown';
import { Typography, Theme } from '../../styles/index';

interface MarkdownTextProps {
    children: string;
    style?: TextStyle;
    variant?: 'bodyMedium' | 'bodyLarge' | 'captionSmall';
    color?: 'primary' | 'secondary' | 'disabled';
}

/**
 * MarkdownText Component
 * Renders markdown formatted text with React Native Text components
 */
export const MarkdownText: React.FC<MarkdownTextProps> = ({
    children,
    style,
    variant = 'bodyMedium',
    color = 'secondary',
}) => {
    // Parse markdown once
    const segments = useMemo(() => parseMarkdown(children), [children]);

    // Calculate base style
    const baseStyle = useMemo(() => {
        const colorValue =
            color === 'primary'
                ? Theme.text.primary
                : color === 'secondary'
                    ? Theme.text.secondary
                    : Theme.text.disabled;

        return {
            fontSize: Typography.size[variant],
            lineHeight: Typography.lineHeight[variant],
            color: colorValue,
            fontFamily: Typography.family.regular,
        };
    }, [variant, color]);

    /**
     * Render a single markdown segment with appropriate styling
     */
    const renderSegment = (segment: MarkdownSegment, index: number): React.ReactElement => {
        const segmentStyle: TextStyle[] = [baseStyle];
        const { style: markdownStyle } = segment;

        // Bold
        if (markdownStyle.bold) {
            segmentStyle.push({ fontFamily: Typography.family.bold });
        }

        // Italic
        if (markdownStyle.italic) {
            segmentStyle.push({ fontStyle: 'italic' as const });
        }

        // Strikethrough
        if ('strikethrough' in markdownStyle && markdownStyle.strikethrough) {
            segmentStyle.push({ textDecorationLine: 'line-through' as const });
        }

        // Code
        if (markdownStyle.code) {
            segmentStyle.push(styles.code);
        }

        // Link
        if ('link' in markdownStyle && markdownStyle.link) {
            segmentStyle.push(styles.link);
        }

        // Heading
        if (markdownStyle.heading) {
            const headingLevel = Math.min(3, markdownStyle.heading);
            const headingKey = `h${headingLevel}` as 'h1' | 'h2' | 'h3';
            segmentStyle.push({
                fontFamily: Typography.family.bold,
                fontSize: Typography.size[headingKey],
                lineHeight: Typography.lineHeight[headingKey],
                color: Theme.text.primary,
            });
        }

        return (
            <Text key={`segment-${index}`} style={segmentStyle}>
                {segment.text}
            </Text>
        );
    };

    return (
        <Text style={[baseStyle, style]}>
            {segments.map((segment, index) => renderSegment(segment, index))}
        </Text>
    );
};

MarkdownText.displayName = 'MarkdownText';

const styles = StyleSheet.create({
    code: {
        fontFamily: 'Courier',
        backgroundColor: Theme.background.paper,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
    },
    link: {
        color: Theme.primary.main,
        textDecorationLine: 'underline' as const,
    },
});
