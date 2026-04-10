// prisma/seed/exercises.seed.ts
// Comprehensive exercise seeding for Simple Present Tense lessons

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MultipleChoiceContent {
  type: 'multiple_choice';
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface FillBlankContent {
  type: 'fill_blank';
  sentence: string;
  blank: string;
  correctAnswer: string;
  alternatives?: string[];
}

interface TranslationContent {
  type: 'translation';
  sourceText: string;
  sourceLang: 'en' | 'tr';
  targetLang: 'en' | 'tr';
  correctAnswer: string;
  alternatives?: string[];
}

interface MatchingContent {
  type: 'matching';
  pairs: Array<{ left: string; right: string }>;
}

interface ListeningContent {
  type: 'listening';
  audioUrl: string;
  question: string;
  options: string[];
  correctIndex: number;
}

type ExerciseContent = 
  | MultipleChoiceContent 
  | FillBlankContent 
  | TranslationContent 
  | MatchingContent 
  | ListeningContent;

/**
 * Seeds exercises for Unit 1 (Simple Present Tense - Basics)
 */
export async function seedExercises() {
  console.log('📝 Seeding exercises...');

  // Get Unit 1
  const course = await prisma.course.findFirst({
    where: { learningLangCode: 'en', fromLangCode: 'tr' },
  });

  if (!course) {
    console.log('  ⚠️ Course not found, skipping exercises');
    return;
  }

  const unit1 = await prisma.unit.findFirst({
    where: { courseId: course.id, orderIndex: 1 },
    include: { levels: { orderBy: { orderIndex: 'asc' } } },
  });

  if (!unit1 || unit1.levels.length === 0) {
    console.log('  ⚠️ Unit 1 or levels not found, skipping exercises');
    return;
  }

  // Level 1 Exercises - Introduction to Simple Present
  const level1 = unit1.levels[0];
  const level1Exercises: Array<{ type: string; difficultyScore: number; content: ExerciseContent }> = [
    {
      type: 'multiple_choice',
      difficultyScore: 1,
      content: {
        type: 'multiple_choice',
        question: 'I ___ to school every day.',
        options: ['go', 'goes', 'going', 'went'],
        correctIndex: 0,
        explanation: 'I, you, we, they → verb (go)',
      },
    },
    {
      type: 'multiple_choice',
      difficultyScore: 1,
      content: {
        type: 'multiple_choice',
        question: 'She ___ coffee in the morning.',
        options: ['drink', 'drinks', 'drinking', 'drank'],
        correctIndex: 1,
        explanation: 'He/She/It → verb + s (drinks)',
      },
    },
    {
      type: 'fill_blank',
      difficultyScore: 2,
      content: {
        type: 'fill_blank',
        sentence: 'They ___ football on Sundays.',
        blank: '___',
        correctAnswer: 'play',
        alternatives: ['plays'],
      },
    },
    {
      type: 'translation',
      difficultyScore: 2,
      content: {
        type: 'translation',
        sourceText: 'Ben her gün kitap okurum.',
        sourceLang: 'tr',
        targetLang: 'en',
        correctAnswer: 'I read books every day.',
        alternatives: ['I read a book every day.'],
      },
    },
    {
      type: 'multiple_choice',
      difficultyScore: 1,
      content: {
        type: 'multiple_choice',
        question: 'My brother ___ at a hospital.',
        options: ['work', 'works', 'working', 'worked'],
        correctIndex: 1,
        explanation: 'He/She/It → verb + s (works)',
      },
    },
    {
      type: 'matching',
      difficultyScore: 2,
      content: {
        type: 'matching',
        pairs: [
          { left: 'I eat', right: 'Ben yerim' },
          { left: 'She sleeps', right: 'O uyur' },
          { left: 'We work', right: 'Biz çalışırız' },
          { left: 'They play', right: 'Onlar oynar' },
        ],
      },
    },
    {
      type: 'fill_blank',
      difficultyScore: 2,
      content: {
        type: 'fill_blank',
        sentence: 'He ___ English very well.',
        blank: '___',
        correctAnswer: 'speaks',
        alternatives: ['speak'],
      },
    },
    {
      type: 'multiple_choice',
      difficultyScore: 1,
      content: {
        type: 'multiple_choice',
        question: 'My parents ___ in Istanbul.',
        options: ['live', 'lives', 'living', 'lived'],
        correctIndex: 0,
        explanation: 'They (parents) → verb (live)',
      },
    },
    {
      type: 'translation',
      difficultyScore: 3,
      content: {
        type: 'translation',
        sourceText: 'She wakes up at 7 AM.',
        sourceLang: 'en',
        targetLang: 'tr',
        correctAnswer: 'O sabah 7\'de uyanır.',
        alternatives: ['O saat 7\'de uyanır.'],
      },
    },
    {
      type: 'multiple_choice',
      difficultyScore: 2,
      content: {
        type: 'multiple_choice',
        question: 'The sun ___ in the east.',
        options: ['rise', 'rises', 'rising', 'rose'],
        correctIndex: 1,
        explanation: 'Genel doğrular için Simple Present kullanılır.',
      },
    },
  ];

  // Clear existing exercises for this level
  await prisma.exercise.deleteMany({ where: { levelId: level1.id } });

  // Create exercises
  await prisma.exercise.createMany({
    data: level1Exercises.map((ex) => ({
      levelId: level1.id,
      type: ex.type,
      difficultyScore: ex.difficultyScore,
      content: ex.content as object,
    })),
  });

  console.log(`  ✅ Level 1: ${level1Exercises.length} exercises created`);

  // Level 2 Exercises - More practice
  if (unit1.levels.length >= 2) {
    const level2 = unit1.levels[1];
    const level2Exercises: Array<{ type: string; difficultyScore: number; content: ExerciseContent }> = [
      {
        type: 'multiple_choice',
        difficultyScore: 2,
        content: {
          type: 'multiple_choice',
          question: 'The baby ___ a lot at night.',
          options: ['cry', 'cries', 'crying', 'cried'],
          correctIndex: 1,
          explanation: 'cry → cries (y → ies)',
        },
      },
      {
        type: 'fill_blank',
        difficultyScore: 2,
        content: {
          type: 'fill_blank',
          sentence: 'Water ___ at 100 degrees Celsius.',
          blank: '___',
          correctAnswer: 'boils',
        },
      },
      {
        type: 'translation',
        difficultyScore: 3,
        content: {
          type: 'translation',
          sourceText: 'Onlar her hafta sonu sinemaya giderler.',
          sourceLang: 'tr',
          targetLang: 'en',
          correctAnswer: 'They go to the cinema every weekend.',
        },
      },
      {
        type: 'multiple_choice',
        difficultyScore: 2,
        content: {
          type: 'multiple_choice',
          question: 'He ___ his teeth twice a day.',
          options: ['brush', 'brushes', 'brushing', 'brushed'],
          correctIndex: 1,
          explanation: 'brush → brushes (sh → shes)',
        },
      },
      {
        type: 'matching',
        difficultyScore: 3,
        content: {
          type: 'matching',
          pairs: [
            { left: 'wake up', right: 'uyanmak' },
            { left: 'get dressed', right: 'giyinmek' },
            { left: 'have breakfast', right: 'kahvaltı yapmak' },
            { left: 'go to work', right: 'işe gitmek' },
          ],
        },
      },
    ];

    await prisma.exercise.deleteMany({ where: { levelId: level2.id } });
    await prisma.exercise.createMany({
      data: level2Exercises.map((ex) => ({
        levelId: level2.id,
        type: ex.type,
        difficultyScore: ex.difficultyScore,
        content: ex.content as object,
      })),
    });

    console.log(`  ✅ Level 2: ${level2Exercises.length} exercises created`);
  }

  console.log('📝 Exercise seeding complete!');
}
