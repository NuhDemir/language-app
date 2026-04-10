// prisma/seed/courses.seed.ts
// Comprehensive course seeding with Simple Present Tense topic

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seeds the curriculum for the English for Turkish Speakers course.
 * Focus: Simple Present Tense with progressive difficulty.
 */
export async function seedCourseContent() {
  console.log('📚 Seeding course curriculum...');

  // Get the main course
  const course = await prisma.course.findFirst({
    where: {
      learningLangCode: 'en',
      fromLangCode: 'tr',
    },
  });

  if (!course) {
    console.log('  ⚠️ Main course not found, skipping curriculum seed');
    return;
  }

  // ============================================================
  // UNIT 1: Simple Present Tense - Basics
  // ============================================================
  const unit1 = await prisma.unit.upsert({
    where: { uq_unit_order: { courseId: course.id, orderIndex: 1 } },
    update: {},
    create: {
      courseId: course.id,
      orderIndex: 1,
      title: 'Simple Present Tense - Basics',
      description: 'Learn the fundamentals of Simple Present Tense. Daily routines and habits.',
      colorTheme: '#3da9fc',
      iconUrl: 'unit_basics.png',
      guidebookContent: {
        summary: 'Simple Present Tense, tekrarlanan eylemler, alışkanlıklar ve genel doğrular için kullanılır.',
        grammar_tips: [
          'I/You/We/They → verb (work, eat, play)',
          'He/She/It → verb + s/es (works, eats, plays)',
          'Olumsuz: do not / does not + verb',
          'Soru: Do/Does + subject + verb?',
        ],
        examples: [
          { en: 'I wake up at 7 AM.', tr: 'Ben sabah 7\'de uyanırım.' },
          { en: 'She drinks coffee every morning.', tr: 'O her sabah kahve içer.' },
          { en: 'They play football on Sundays.', tr: 'Onlar Pazarları futbol oynar.' },
        ],
      },
    },
  });
  console.log(`  ✅ Unit 1: ${unit1.title}`);

  // Unit 1 Levels
  const unit1Levels = [
    { orderIndex: 1, totalLessons: 5 },
    { orderIndex: 2, totalLessons: 5 },
    { orderIndex: 3, totalLessons: 6 },
    { orderIndex: 4, totalLessons: 5 },
    { orderIndex: 5, totalLessons: 6 },
  ];

  for (const level of unit1Levels) {
    await prisma.level.upsert({
      where: { uq_level_order: { unitId: unit1.id, orderIndex: level.orderIndex } },
      update: {},
      create: {
        unitId: unit1.id,
        orderIndex: level.orderIndex,
        totalLessons: level.totalLessons,
      },
    });
  }
  console.log(`     → Created ${unit1Levels.length} levels`);

  // ============================================================
  // UNIT 2: Simple Present Tense - Negatives & Questions
  // ============================================================
  const unit2 = await prisma.unit.upsert({
    where: { uq_unit_order: { courseId: course.id, orderIndex: 2 } },
    update: {},
    create: {
      courseId: course.id,
      orderIndex: 2,
      title: 'Negatives & Questions',
      description: 'Master negative sentences and question forms in Simple Present.',
      colorTheme: '#2cb67d',
      iconUrl: 'unit_questions.png',
      guidebookContent: {
        summary: 'Bu ünitede olumsuz cümleler ve soru cümleleri yapısını öğreneceksiniz.',
        grammar_tips: [
          'Olumsuz: I do not (don\'t) like coffee.',
          'Olumsuz (3. tekil): She does not (doesn\'t) work here.',
          'Soru: Do you want tea?',
          'Soru (3. tekil): Does he play guitar?',
        ],
        examples: [
          { en: 'I don\'t eat meat.', tr: 'Ben et yemem.' },
          { en: 'Does she speak English?', tr: 'O İngilizce konuşuyor mu?' },
          { en: 'They don\'t watch TV.', tr: 'Onlar TV izlemezler.' },
        ],
      },
    },
  });
  console.log(`  ✅ Unit 2: ${unit2.title}`);

  const unit2Levels = [
    { orderIndex: 1, totalLessons: 6 },
    { orderIndex: 2, totalLessons: 5 },
    { orderIndex: 3, totalLessons: 6 },
    { orderIndex: 4, totalLessons: 5 },
  ];

  for (const level of unit2Levels) {
    await prisma.level.upsert({
      where: { uq_level_order: { unitId: unit2.id, orderIndex: level.orderIndex } },
      update: {},
      create: {
        unitId: unit2.id,
        orderIndex: level.orderIndex,
        totalLessons: level.totalLessons,
      },
    });
  }
  console.log(`     → Created ${unit2Levels.length} levels`);

  // ============================================================
  // UNIT 3: Daily Routines
  // ============================================================
  const unit3 = await prisma.unit.upsert({
    where: { uq_unit_order: { courseId: course.id, orderIndex: 3 } },
    update: {},
    create: {
      courseId: course.id,
      orderIndex: 3,
      title: 'Daily Routines',
      description: 'Talk about your daily activities and schedules.',
      colorTheme: '#ffbc0a',
      iconUrl: 'unit_routines.png',
      guidebookContent: {
        summary: 'Günlük rutinlerinizi İngilizce anlatmayı öğrenin.',
        vocabulary: [
          { en: 'wake up', tr: 'uyanmak' },
          { en: 'get dressed', tr: 'giyinmek' },
          { en: 'have breakfast', tr: 'kahvaltı yapmak' },
          { en: 'go to work', tr: 'işe gitmek' },
          { en: 'come home', tr: 'eve gelmek' },
          { en: 'go to bed', tr: 'yatmak' },
        ],
        examples: [
          { en: 'I wake up at 6:30 every day.', tr: 'Her gün 6:30\'da uyanırım.' },
          { en: 'She takes a shower in the morning.', tr: 'O sabahları duş alır.' },
          { en: 'We have dinner at 7 PM.', tr: 'Akşam 7\'de yemek yeriz.' },
        ],
      },
    },
  });
  console.log(`  ✅ Unit 3: ${unit3.title}`);

  const unit3Levels = [
    { orderIndex: 1, totalLessons: 5 },
    { orderIndex: 2, totalLessons: 6 },
    { orderIndex: 3, totalLessons: 5 },
    { orderIndex: 4, totalLessons: 6 },
    { orderIndex: 5, totalLessons: 5 },
  ];

  for (const level of unit3Levels) {
    await prisma.level.upsert({
      where: { uq_level_order: { unitId: unit3.id, orderIndex: level.orderIndex } },
      update: {},
      create: {
        unitId: unit3.id,
        orderIndex: level.orderIndex,
        totalLessons: level.totalLessons,
      },
    });
  }
  console.log(`     → Created ${unit3Levels.length} levels`);

  // ============================================================
  // UNIT 4: Ordering Food
  // ============================================================
  const unit4 = await prisma.unit.upsert({
    where: { uq_unit_order: { courseId: course.id, orderIndex: 4 } },
    update: {},
    create: {
      courseId: course.id,
      orderIndex: 4,
      title: 'Ordering Food',
      description: 'Learn to order food at restaurants and cafes.',
      colorTheme: '#ef4565',
      iconUrl: 'unit_food.png',
      guidebookContent: {
        summary: 'Restoranda ve kafede yemek sipariş etmeyi öğrenin.',
        key_phrases: [
          { en: 'I would like...', tr: 'Ben ... istiyorum.' },
          { en: 'Can I have...?', tr: '... alabilir miyim?' },
          { en: 'What do you recommend?', tr: 'Ne tavsiye edersiniz?' },
          { en: 'The check, please.', tr: 'Hesap, lütfen.' },
        ],
        vocabulary: [
          { en: 'menu', tr: 'menü' },
          { en: 'starter', tr: 'başlangıç' },
          { en: 'main course', tr: 'ana yemek' },
          { en: 'dessert', tr: 'tatlı' },
          { en: 'bill', tr: 'hesap' },
          { en: 'tip', tr: 'bahşiş' },
        ],
      },
    },
  });
  console.log(`  ✅ Unit 4: ${unit4.title}`);

  const unit4Levels = [
    { orderIndex: 1, totalLessons: 6 },
    { orderIndex: 2, totalLessons: 5 },
    { orderIndex: 3, totalLessons: 6 },
    { orderIndex: 4, totalLessons: 6 },
    { orderIndex: 5, totalLessons: 5 },
    { orderIndex: 6, totalLessons: 6 },
  ];

  for (const level of unit4Levels) {
    await prisma.level.upsert({
      where: { uq_level_order: { unitId: unit4.id, orderIndex: level.orderIndex } },
      update: {},
      create: {
        unitId: unit4.id,
        orderIndex: level.orderIndex,
        totalLessons: level.totalLessons,
      },
    });
  }
  console.log(`     → Created ${unit4Levels.length} levels`);

  // ============================================================
  // UNIT 5: Work & Professions
  // ============================================================
  const unit5 = await prisma.unit.upsert({
    where: { uq_unit_order: { courseId: course.id, orderIndex: 5 } },
    update: {},
    create: {
      courseId: course.id,
      orderIndex: 5,
      title: 'Work & Professions',
      description: 'Talk about jobs, workplaces and professional activities.',
      colorTheme: '#7048e8',
      iconUrl: 'unit_work.png',
      guidebookContent: {
        summary: 'İş ve meslekler hakkında konuşmayı öğrenin.',
        vocabulary: [
          { en: 'doctor', tr: 'doktor' },
          { en: 'teacher', tr: 'öğretmen' },
          { en: 'engineer', tr: 'mühendis' },
          { en: 'lawyer', tr: 'avukat' },
          { en: 'nurse', tr: 'hemşire' },
          { en: 'programmer', tr: 'programcı' },
        ],
        examples: [
          { en: 'What do you do?', tr: 'Ne iş yapıyorsun?' },
          { en: 'I am a software developer.', tr: 'Ben bir yazılım geliştiricisiyim.' },
          { en: 'She works at a hospital.', tr: 'O bir hastanede çalışıyor.' },
        ],
      },
    },
  });
  console.log(`  ✅ Unit 5: ${unit5.title}`);

  const unit5Levels = [
    { orderIndex: 1, totalLessons: 5 },
    { orderIndex: 2, totalLessons: 6 },
    { orderIndex: 3, totalLessons: 5 },
    { orderIndex: 4, totalLessons: 6 },
  ];

  for (const level of unit5Levels) {
    await prisma.level.upsert({
      where: { uq_level_order: { unitId: unit5.id, orderIndex: level.orderIndex } },
      update: {},
      create: {
        unitId: unit5.id,
        orderIndex: level.orderIndex,
        totalLessons: level.totalLessons,
      },
    });
  }
  console.log(`     → Created ${unit5Levels.length} levels`);

  console.log('📚 Course curriculum seeding complete!');
}
