// CourseCardContent Component - Composition
import React from 'react';
import { View } from 'react-native';
import { Typography as AppText } from '../../../../components/ui/Typography';
import { Badge } from '../atoms';
import { courseCardStyles } from '../../styles';

interface CourseCardContentProps {
    title: string;
    description?: string;
    learningLangCode: string;
    fromLangCode: string;
    phase: string;
    isEnrolled?: boolean;
    isActive?: boolean;
}

export const CourseCardContent: React.FC<CourseCardContentProps> = ({
    title,
    description,
    learningLangCode,
    fromLangCode,
    phase,
    isEnrolled,
    isActive,
}) => {
    return (
        <>
            <View style={courseCardStyles.cardHeader}>
                <AppText style={courseCardStyles.courseTitle}>{title}</AppText>
                {isEnrolled && <Badge variant="enrolled" text="Enrolled" />}
                {isActive && <Badge variant="active" text="Active" />}
            </View>

            {description && (
                <AppText style={courseCardStyles.courseDescription}>{description}</AppText>
            )}

            <View style={courseCardStyles.languageInfo}>
                <AppText style={courseCardStyles.languageText}>
                    {learningLangCode} from {fromLangCode}
                </AppText>
                <View style={courseCardStyles.languageRow}>
                    <Badge variant={phase === 'live' ? 'live' : 'beta'} text={phase} />
                </View>
            </View>
        </>
    );
};
