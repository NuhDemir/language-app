import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding languages...');

  const languages = [
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flagEmoji: '🇹🇷', direction: 'LTR' },
    { code: 'en', name: 'English', nativeName: 'English', flagEmoji: '🇺🇸', direction: 'LTR' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flagEmoji: '🇪🇸', direction: 'LTR' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flagEmoji: '🇩🇪', direction: 'LTR' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flagEmoji: '🇸🇦', direction: 'RTL' },
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: {},
      create: lang,
    });
    console.log(`  ✅ ${lang.name} (${lang.code})`);
  }

  // --------------------------------------------------------
  // COURSES (Phase 6)
  // --------------------------------------------------------
  console.log('🌱 Seeding courses...');

  const courses = [
    {
      learningLangCode: 'en',
      fromLangCode: 'tr',
      title: 'Türkçe Konuşanlar İçin İngilizce',
      phase: 'live',
    },
    {
      learningLangCode: 'es',
      fromLangCode: 'en',
      title: 'Spanish for English Speakers',
      phase: 'live',
    },
    {
      learningLangCode: 'tr',
      fromLangCode: 'en',
      title: 'Turkish for English Speakers',
      phase: 'beta',
    },
  ];

  for (const course of courses) {
    await prisma.course.upsert({
      where: {
        uq_course_path: {
          learningLangCode: course.learningLangCode,
          fromLangCode: course.fromLangCode,
        },
      },
      update: {},
      create: course,
    });
    console.log(`  ✅ ${course.title}`);
  }

  // --------------------------------------------------------
  // ITEMS - Shop Catalog (Phase 20)
  // --------------------------------------------------------
  console.log('🌱 Seeding shop items...');

  const items = [
    {
      name: 'Streak Freeze',
      type: 'powerup',
      costGems: 200,
      isConsumable: true,
      metadata: {
        description: 'Bir gün girmesen bile serini korur.',
        icon: 'freeze.png',
        effectDuration: '24h',
      },
    },
    {
      name: 'Super Duo Costume',
      type: 'costume',
      costGems: 1000,
      isConsumable: false,
      metadata: {
        asset_url: 'costume_super_duo.glb',
        preview_url: 'costume_super_duo_preview.png',
      },
    },
    {
      name: 'Double XP Boost',
      type: 'powerup',
      costGems: 300,
      isConsumable: true,
      metadata: {
        description: '15 dakika boyunca kazandığın XP 2 katına çıkar.',
        icon: 'double_xp.png',
        effectDuration: '15m',
      },
    },
    {
      name: 'Night Owl Costume',
      type: 'costume',
      costGems: 750,
      isConsumable: false,
      metadata: {
        asset_url: 'costume_night_owl.glb',
        preview_url: 'costume_night_owl_preview.png',
      },
    },
  ];

  for (const item of items) {
    // Using upsert to allow re-running seed without duplicates
    await prisma.item.upsert({
      where: {
        id: items.indexOf(item) + 1, // Simple ID mapping for upsert
      },
      update: {}, // Don't update existing items
      create: item,
    });
    console.log(`  ✅ ${item.name} (${item.type})`);
  }

  // --------------------------------------------------------
  // LEAGUES - Tier Definitions (Phase 25)
  // --------------------------------------------------------
  console.log('🌱 Seeding leagues...');

  const leagues = [
    {
      tier: 1,
      name: 'Bronze',
      promotionThreshold: 5, // Top 5 get promoted
      demotionThreshold: 0, // Can't demote from Bronze
    },
    {
      tier: 2,
      name: 'Silver',
      promotionThreshold: 5,
      demotionThreshold: 5, // Bottom 5 get demoted
    },
    {
      tier: 3,
      name: 'Gold',
      promotionThreshold: 5,
      demotionThreshold: 5,
    },
    {
      tier: 4,
      name: 'Platinum',
      promotionThreshold: 3, // Only top 3 get promoted
      demotionThreshold: 5,
    },
    {
      tier: 5,
      name: 'Diamond',
      promotionThreshold: 0, // Can't promote from Diamond
      demotionThreshold: 5,
    },
  ];

  for (const league of leagues) {
    await prisma.league.upsert({
      where: { tier: league.tier },
      update: {}, // Don't update existing leagues
      create: league,
    });
    console.log(`  ✅ ${league.name} (Tier ${league.tier})`);
  }

  // --------------------------------------------------------
  // LOOT BOXES - Gacha System (Phase 27)
  // --------------------------------------------------------
  console.log('🌱 Seeding loot boxes...');

  // Create Starter Box
  const starterBox = await prisma.lootBox.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Starter Box',
      costGems: 100,
      description: 'A box for beginners with common rewards',
      isActive: true,
    },
  });
  console.log(`  ✅ ${starterBox.name}`);

  // Create Premium Box
  const premiumBox = await prisma.lootBox.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Premium Box',
      costGems: 500,
      description: 'Higher chance for rare items!',
      isActive: true,
    },
  });
  console.log(`  ✅ ${premiumBox.name}`);

  // Add rates for Starter Box
  const starterRates = [
    { lootBoxId: 1, itemType: 'GEMS', itemValue: '25', weight: 100, isRare: false },
    { lootBoxId: 1, itemType: 'GEMS', itemValue: '50', weight: 50, isRare: false },
    { lootBoxId: 1, itemType: 'XP', itemValue: '100', weight: 80, isRare: false },
    { lootBoxId: 1, itemType: 'ITEM', itemValue: 'item_1', weight: 10, isRare: true }, // Streak Freeze
    { lootBoxId: 1, itemType: 'GEMS', itemValue: '200', weight: 1, isRare: true }, // Jackpot!
  ];

  // Add rates for Premium Box
  const premiumRates = [
    { lootBoxId: 2, itemType: 'GEMS', itemValue: '100', weight: 50, isRare: false },
    { lootBoxId: 2, itemType: 'GEMS', itemValue: '250', weight: 30, isRare: false },
    { lootBoxId: 2, itemType: 'ITEM', itemValue: 'item_2', weight: 20, isRare: true }, // Costume
    { lootBoxId: 2, itemType: 'ITEM', itemValue: 'item_3', weight: 15, isRare: true }, // Double XP
    { lootBoxId: 2, itemType: 'GEMS', itemValue: '1000', weight: 1, isRare: true }, // Mega Jackpot!
  ];

  // Clear existing rates and insert new ones
  await prisma.lootBoxRate.deleteMany({});
  await prisma.lootBoxRate.createMany({
    data: [...starterRates, ...premiumRates],
  });
  console.log(`  ✅ Added ${starterRates.length + premiumRates.length} loot box rates`);

  // --------------------------------------------------------
  // ACHIEVEMENTS - Gamification System (Phase 28)
  // --------------------------------------------------------
  console.log('🌱 Seeding achievements...');

  const achievements = [
    {
      code: 'wildfire',
      name: 'Wildfire',
      description: 'Maintain your learning streak!',
      tiers: {
        '1': { goal: 3, reward_gems: 5 },
        '2': { goal: 7, reward_gems: 15 },
        '3': { goal: 14, reward_gems: 30 },
        '4': { goal: 30, reward_gems: 75 },
        '5': { goal: 100, reward_gems: 200 },
      },
    },
    {
      code: 'sage',
      name: 'Sage',
      description: 'Complete lessons to prove your dedication',
      tiers: {
        '1': { goal: 10, reward_gems: 10 },
        '2': { goal: 50, reward_gems: 25 },
        '3': { goal: 100, reward_gems: 50 },
        '4': { goal: 500, reward_gems: 150 },
        '5': { goal: 1000, reward_gems: 500 },
      },
    },
    {
      code: 'sharpshooter',
      name: 'Sharpshooter',
      description: 'Complete lessons with perfect accuracy',
      tiers: {
        '1': { goal: 5, reward_gems: 15 },
        '2': { goal: 25, reward_gems: 40 },
        '3': { goal: 100, reward_gems: 100 },
      },
    },
    {
      code: 'collector',
      name: 'Collector',
      description: 'Collect items from the shop',
      tiers: {
        '1': { goal: 1, reward_gems: 5 },
        '2': { goal: 5, reward_gems: 20 },
        '3': { goal: 10, reward_gems: 50 },
      },
    },
    {
      code: 'polyglot',
      name: 'Polyglot',
      description: 'Learn words across multiple languages',
      tiers: {
        '1': { goal: 50, reward_gems: 10 },
        '2': { goal: 200, reward_gems: 30 },
        '3': { goal: 500, reward_gems: 75 },
        '4': { goal: 1000, reward_gems: 150 },
        '5': { goal: 5000, reward_gems: 500 },
      },
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: {}, // Don't update existing
      create: achievement,
    });
    console.log(`  ✅ ${achievement.name} (${Object.keys(achievement.tiers).length} tiers)`);
  }

  // --------------------------------------------------------
  // COURSE CONTENT (Units, Levels, Exercises)
  // --------------------------------------------------------
  console.log('📚 Seeding course curriculum...');

  // Get the main course
  const mainCourse = await prisma.course.findFirst({
    where: {
      learningLangCode: 'en',
      fromLangCode: 'tr',
    },
  });

  if (mainCourse) {
    // UNIT 1: Simple Present Tense - Basics
    const unit1 = await prisma.unit.upsert({
      where: { uq_unit_order: { courseId: mainCourse.id, orderIndex: 1 } },
      update: {},
      create: {
        courseId: mainCourse.id,
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
          ],
        },
      },
    });
    console.log(`  ✅ Unit 1: ${unit1.title}`);

    // Create levels for Unit 1
    for (let i = 1; i <= 5; i++) {
      await prisma.level.upsert({
        where: { uq_level_order: { unitId: unit1.id, orderIndex: i } },
        update: {},
        create: {
          unitId: unit1.id,
          orderIndex: i,
          totalLessons: 5 + (i % 2),
        },
      });
    }
    console.log(`     → Created 5 levels`);

    // UNIT 2: Negatives & Questions
    const unit2 = await prisma.unit.upsert({
      where: { uq_unit_order: { courseId: mainCourse.id, orderIndex: 2 } },
      update: {},
      create: {
        courseId: mainCourse.id,
        orderIndex: 2,
        title: 'Negatives & Questions',
        description: 'Master negative sentences and question forms in Simple Present.',
        colorTheme: '#2cb67d',
        iconUrl: 'unit_questions.png',
      },
    });
    console.log(`  ✅ Unit 2: ${unit2.title}`);

    for (let i = 1; i <= 4; i++) {
      await prisma.level.upsert({
        where: { uq_level_order: { unitId: unit2.id, orderIndex: i } },
        update: {},
        create: {
          unitId: unit2.id,
          orderIndex: i,
          totalLessons: 5 + (i % 2),
        },
      });
    }
    console.log(`     → Created 4 levels`);

    // UNIT 3: Daily Routines
    const unit3 = await prisma.unit.upsert({
      where: { uq_unit_order: { courseId: mainCourse.id, orderIndex: 3 } },
      update: {},
      create: {
        courseId: mainCourse.id,
        orderIndex: 3,
        title: 'Daily Routines',
        description: 'Talk about your daily activities and schedules.',
        colorTheme: '#ffbc0a',
        iconUrl: 'unit_routines.png',
      },
    });
    console.log(`  ✅ Unit 3: ${unit3.title}`);

    for (let i = 1; i <= 5; i++) {
      await prisma.level.upsert({
        where: { uq_level_order: { unitId: unit3.id, orderIndex: i } },
        update: {},
        create: {
          unitId: unit3.id,
          orderIndex: i,
          totalLessons: 5 + (i % 2),
        },
      });
    }
    console.log(`     → Created 5 levels`);

    // UNIT 4: Ordering Food
    const unit4 = await prisma.unit.upsert({
      where: { uq_unit_order: { courseId: mainCourse.id, orderIndex: 4 } },
      update: {},
      create: {
        courseId: mainCourse.id,
        orderIndex: 4,
        title: 'Ordering Food',
        description: 'Learn to order food at restaurants and cafes.',
        colorTheme: '#ef4565',
        iconUrl: 'unit_food.png',
      },
    });
    console.log(`  ✅ Unit 4: ${unit4.title}`);

    for (let i = 1; i <= 6; i++) {
      await prisma.level.upsert({
        where: { uq_level_order: { unitId: unit4.id, orderIndex: i } },
        update: {},
        create: {
          unitId: unit4.id,
          orderIndex: i,
          totalLessons: 5 + (i % 2),
        },
      });
    }
    console.log(`     → Created 6 levels`);

    // UNIT 5: Work & Professions
    const unit5 = await prisma.unit.upsert({
      where: { uq_unit_order: { courseId: mainCourse.id, orderIndex: 5 } },
      update: {},
      create: {
        courseId: mainCourse.id,
        orderIndex: 5,
        title: 'Work & Professions',
        description: 'Talk about jobs, workplaces and professional activities.',
        colorTheme: '#7048e8',
        iconUrl: 'unit_work.png',
      },
    });
    console.log(`  ✅ Unit 5: ${unit5.title}`);

    for (let i = 1; i <= 4; i++) {
      await prisma.level.upsert({
        where: { uq_level_order: { unitId: unit5.id, orderIndex: i } },
        update: {},
        create: {
          unitId: unit5.id,
          orderIndex: i,
          totalLessons: 5 + (i % 2),
        },
      });
    }
    console.log(`     → Created 4 levels`);
  }

  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

