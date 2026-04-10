/**
 * Markdown Parser Utility
 * Simple markdown parser for basic text formatting
 */

export interface MarkdownSegment {
    text: string;
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
}

/**
 * Parse markdown text into segments
 * Supports: **bold**, *italic*, `code`
 */
export function parseMarkdown(text: string): MarkdownSegment[] {
    const segments: MarkdownSegment[] = [];
    let currentIndex = 0;

    // Simple regex patterns
    const patterns = [
        { regex: /\*\*(.+?)\*\*/g, type: 'bold' as const },
        { regex: /\*(.+?)\*/g, type: 'italic' as const },
        { regex: /`(.+?)`/g, type: 'code' as const },
    ];

    // Find all matches
    const matches: Array<{ index: number; length: number; text: string; type: 'bold' | 'italic' | 'code' }> = [];

    patterns.forEach(({ regex, type }) => {
        let match;
        const re = new RegExp(regex.source, regex.flags);
        while ((match = re.exec(text)) !== null) {
            matches.push({
                index: match.index,
                length: match[0].length,
                text: match[1],
                type,
            });
        }
    });

    // Sort matches by index
    matches.sort((a, b) => a.index - b.index);

    // Build segments
    matches.forEach((match) => {
        // Add plain text before match
        if (match.index > currentIndex) {
            const plainText = text.substring(currentIndex, match.index);
            if (plainText) {
                segments.push({ text: plainText });
            }
        }

        // Add formatted segment
        segments.push({
            text: match.text,
            [match.type]: true,
        });

        currentIndex = match.index + match.length;
    });

    // Add remaining plain text
    if (currentIndex < text.length) {
        const plainText = text.substring(currentIndex);
        if (plainText) {
            segments.push({ text: plainText });
        }
    }

    // If no matches, return the whole text as plain
    if (segments.length === 0) {
        segments.push({ text });
    }

    return segments;
}
