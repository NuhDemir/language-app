import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectionString = process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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

  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
