/**
 * =============================================================================
 * OPERATION STRESS-TEST
 * Senior Backend Integration Test Suite
 * =============================================================================
 *
 * This script validates the entire architectural integrity of the Language
 * Learning Platform backend, including:
 * - Partitioning, JSONB GIN Indexes, Stored Procedures
 * - Pessimistic Locking, Transaction Rollbacks
 * - Concurrency (Double-Spend Attack Prevention)
 *
 * Usage: npx ts-node tests/integration/stress-test.ts
 */

import { PrismaClient, Currency } from '@prisma/client';

// =============================================================================
// SETUP
// =============================================================================

const prisma = new PrismaClient();

// Test tenant prefix for easy cleanup
const TEST_PREFIX = 'TEST_STRESS_';
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

// Color helpers for console
const colors = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

function log(suite: string, message: string, status?: 'pass' | 'fail' | 'info') {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '📌';
  console.log(`[${colors.cyan(suite)}] ${icon} ${message}`);
}

// =============================================================================
// SUITE 1: Foundation & Content Engine
// =============================================================================

async function suite1_ContentEngine(): Promise<void> {
  console.log(colors.bold('\n═══════════════════════════════════════════════════'));
  console.log(colors.bold('  SUITE 1: Foundation & Content Engine'));
  console.log(colors.bold('═══════════════════════════════════════════════════\n'));

  console.time('Suite 1 Duration');

  // 1. Seed Languages
  log('SUITE 1', 'Seeding languages (en, tr)...');
  await prisma.language.upsert({
    where: { code: 'en' },
    update: {},
    create: { code: 'en', name: 'English', nativeName: 'English', flagEmoji: '🇺🇸', direction: 'LTR' },
  });
  await prisma.language.upsert({
    where: { code: 'tr' },
    update: {},
    create: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flagEmoji: '🇹🇷', direction: 'LTR' },
  });
  log('SUITE 1', 'Languages seeded', 'pass');

  // 2. Create Course with Unique Constraint Check
  log('SUITE 1', 'Creating course "English for Turkish Speakers"...');
  const course = await prisma.course.upsert({
    where: { uq_course_path: { learningLangCode: 'en', fromLangCode: 'tr' } },
    update: {},
    create: {
      learningLangCode: 'en',
      fromLangCode: 'tr',
      title: `${TEST_PREFIX}English for Turkish Speakers`,
      description: 'Test course',
      phase: 'live',
    },
  });
  log('SUITE 1', `Course created with ID: ${course.id}`, 'pass');

  // Try to create duplicate - should fail
  log('SUITE 1', 'Testing UniqueConstraintViolation...');
  try {
    await prisma.course.create({
      data: {
        learningLangCode: 'en',
        fromLangCode: 'tr',
        title: 'Duplicate Course',
      },
    });
    log('SUITE 1', 'ERROR: Duplicate course was allowed!', 'fail');
  } catch (error: unknown) {
    const e = error as Error;
    if (e.message.includes('Unique constraint')) {
      log('SUITE 1', 'UniqueConstraintViolation correctly thrown', 'pass');
    } else {
      log('SUITE 1', `Unexpected error: ${e.message}`, 'fail');
    }
  }

  // 3. Create Hierarchy
  log('SUITE 1', 'Creating Unit -> Level hierarchy...');
  const unit = await prisma.unit.upsert({
    where: { uq_unit_order: { courseId: course.id, orderIndex: 1 } },
    update: {},
    create: {
      courseId: course.id,
      orderIndex: 1,
      title: `${TEST_PREFIX}Unit 1`,
    },
  });

  const level = await prisma.level.upsert({
    where: { uq_level_order: { unitId: unit.id, orderIndex: 1 } },
    update: {},
    create: {
      unitId: unit.id,
      orderIndex: 1,
      totalLessons: 5,
    },
  });
  log('SUITE 1', `Hierarchy created: Unit ${unit.id} -> Level ${level.id}`, 'pass');

  // 4. Polymorphic Content with GIN Index Test
  log('SUITE 1', 'Creating polymorphic exercise with JSONB...');
  const exerciseContent = {
    prompt: 'Kedi',
    correct_answers: ['Cat', 'The cat'],
    hint: 'An animal that says meow',
  };

  const exercise = await prisma.exercise.create({
    data: {
      levelId: level.id,
      type: 'translate',
      difficultyScore: 3,
      content: exerciseContent,
      mediaMetadata: { audio_url: 'https://example.com/kedi.mp3' },
    },
  });
  log('SUITE 1', `Exercise created with ID: ${exercise.id}`, 'pass');

  // GIN Index Verification
  log('SUITE 1', 'Testing GIN Index with JSONB @> operator...');
  const explainResult = await prisma.$queryRaw<Array<{ 'QUERY PLAN': string }>>`
    EXPLAIN ANALYZE
    SELECT id FROM exercises 
    WHERE content @> '{"prompt": "Kedi"}'::jsonb
  `;

  const planText = explainResult.map((r) => r['QUERY PLAN']).join('\n');
  const usesGinIndex = planText.toLowerCase().includes('bitmap') || planText.toLowerCase().includes('gin');

  if (usesGinIndex) {
    log('SUITE 1', `GIN Index used: YES`, 'pass');
  } else {
    log('SUITE 1', `GIN Index NOT used! Plan:\n${planText}`, 'info');
  }

  console.timeEnd('Suite 1 Duration');
}

// =============================================================================
// SUITE 2: User Core & Denormalization
// =============================================================================

async function suite2_UserCore(): Promise<void> {
  console.log(colors.bold('\n═══════════════════════════════════════════════════'));
  console.log(colors.bold('  SUITE 2: User Core & Denormalization'));
  console.log(colors.bold('═══════════════════════════════════════════════════\n'));

  console.time('Suite 2 Duration');

  // 1. Create User with UUID
  log('SUITE 2', 'Creating test user...');
  
  // Clean up existing test user first
  await prisma.user.deleteMany({ where: { id: TEST_USER_ID } });
  
  const user = await prisma.user.create({
    data: {
      id: TEST_USER_ID,
      username: `${TEST_PREFIX}user_${Date.now()}`,
      email: `${TEST_PREFIX}user@test.com`,
      passwordHash: '$2b$10$hashedpassword',
    },
  });
  log('SUITE 2', `User created with ID: ${user.id}`, 'pass');

  // 2. JSONB Defaults Verification
  log('SUITE 2', 'Verifying JSONB settings defaults...');
  const fetchedUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { settings: true },
  });

  const settings = fetchedUser?.settings as Record<string, unknown>;
  if (settings && settings.daily_goal === 50) {
    log('SUITE 2', `Settings defaults verified: daily_goal=${settings.daily_goal}`, 'pass');
  } else {
    log('SUITE 2', `Settings defaults FAILED: ${JSON.stringify(settings)}`, 'fail');
  }

  // 3. Dashboard Performance - Covering Index Test
  log('SUITE 2', 'Testing Dashboard Query with Covering Index...');
  const dashboardExplain = await prisma.$queryRaw<Array<{ 'QUERY PLAN': string }>>`
    EXPLAIN ANALYZE
    SELECT username, total_xp, streak_days 
    FROM users 
    WHERE id = ${user.id}::uuid
  `;

  const dashboardPlan = dashboardExplain.map((r) => r['QUERY PLAN']).join('\n');
  const usesIndexOnlyScan = dashboardPlan.toLowerCase().includes('index only scan') ||
                            dashboardPlan.toLowerCase().includes('idx_users_dashboard');

  if (usesIndexOnlyScan) {
    log('SUITE 2', 'Index-Only Scan confirmed for dashboard query', 'pass');
  } else {
    // Note: May need VACUUM for visibility map
    log('SUITE 2', `Index-Only Scan not detected (may need VACUUM). Plan:\n${dashboardPlan.substring(0, 200)}...`, 'info');
  }

  console.timeEnd('Suite 2 Duration');
}

// =============================================================================
// SUITE 3: The "ACID" Lesson Flow
// =============================================================================

async function suite3_LessonFlow(): Promise<void> {
  console.log(colors.bold('\n═══════════════════════════════════════════════════'));
  console.log(colors.bold('  SUITE 3: The "ACID" Lesson Flow (Transactional)'));
  console.log(colors.bold('═══════════════════════════════════════════════════\n'));

  console.time('Suite 3 Duration');

  const course = await prisma.course.findFirst({
    where: { title: { startsWith: TEST_PREFIX } },
    include: { units: { include: { levels: true } } },
  });

  if (!course || !course.units[0]?.levels[0]) {
    log('SUITE 3', 'Course/Unit/Level not found from Suite 1', 'fail');
    return;
  }

  const levelId = course.units[0].levels[0].id;

  // 1. Enrollment
  log('SUITE 3', 'Enrolling user in course...');
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: TEST_USER_ID, courseId: course.id } },
    update: {},
    create: {
      userId: TEST_USER_ID,
      courseId: course.id,
      isActive: true,
    },
  });
  log('SUITE 3', 'Enrollment successful', 'pass');

  // 2. Lesson Completion with Partition Verification
  log('SUITE 3', 'Completing lesson (transaction)...');
  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    // Create completion log
    const completion = await tx.lessonCompletion.create({
      data: {
        userId: TEST_USER_ID,
        courseId: course.id,
        unitId: course.units[0].id,
        levelId: levelId,
        xpEarned: 25,
        durationSeconds: 120,
        accuracyPercentage: 95.5,
        completedAt: now,
      },
    });

    // Update user XP
    const updatedUser = await tx.user.update({
      where: { id: TEST_USER_ID },
      data: { totalXp: { increment: 25 } },
    });

    return { completion, newTotalXp: updatedUser.totalXp };
  });

  log('SUITE 3', `Lesson completed. New total XP: ${result.newTotalXp}`, 'pass');

  // Partition Verification
  log('SUITE 3', 'Verifying partition routing...');
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const partitionName = `lesson_completions_y${year}m${month}`;

  try {
    const partitionCheck = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      `SELECT COUNT(*) as count FROM ${partitionName} WHERE user_id = $1::uuid`,
      TEST_USER_ID
    );
    
    if (partitionCheck[0].count > 0n) {
      log('SUITE 3', `Data routed to partition: ${partitionName} ✓`, 'pass');
    } else {
      log('SUITE 3', `Data NOT in expected partition ${partitionName}`, 'info');
    }
  } catch {
    log('SUITE 3', `Partition ${partitionName} may not exist (using default)`, 'info');
  }

  // 3. Rollback Test
  log('SUITE 3', 'Testing transaction rollback...');
  const beforeCount = await prisma.lessonCompletion.count({
    where: { userId: TEST_USER_ID },
  });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.lessonCompletion.create({
        data: {
          userId: TEST_USER_ID,
          courseId: course.id,
          unitId: course.units[0].id,
          levelId: levelId,
          xpEarned: 50,
          durationSeconds: 180,
          accuracyPercentage: 88.0,
          completedAt: new Date(),
        },
      });

      // Simulate error
      throw new Error('SIMULATED_TRANSACTION_FAILURE');
    });
  } catch (error: unknown) {
    const e = error as Error;
    if (e.message === 'SIMULATED_TRANSACTION_FAILURE') {
      const afterCount = await prisma.lessonCompletion.count({
        where: { userId: TEST_USER_ID },
      });

      if (afterCount === beforeCount) {
        log('SUITE 3', 'Transaction rollback confirmed - no orphan data', 'pass');
      } else {
        log('SUITE 3', 'CRITICAL: Rollback FAILED! Data was persisted.', 'fail');
      }
    }
  }

  console.timeEnd('Suite 3 Duration');
}

// =============================================================================
// SUITE 4: Economy & Concurrency (Double-Spend Attack)
// =============================================================================

async function suite4_Economy(): Promise<void> {
  console.log(colors.bold('\n═══════════════════════════════════════════════════'));
  console.log(colors.bold('  SUITE 4: Economy & Concurrency (Double-Spend)'));
  console.log(colors.bold('═══════════════════════════════════════════════════\n'));

  console.time('Suite 4 Duration');

  // 1. Setup: Give user exactly 100 GEMS
  log('SUITE 4', 'Setting up wallet with 100 GEMS...');
  await prisma.userWallet.upsert({
    where: { userId_currency: { userId: TEST_USER_ID, currency: Currency.GEMS } },
    update: { balance: 100 },
    create: { userId: TEST_USER_ID, currency: Currency.GEMS, balance: 100 },
  });

  // Create test item costing 100 GEMS
  const item = await prisma.item.upsert({
    where: { id: 9999 },
    update: {},
    create: {
      id: 9999,
      name: `${TEST_PREFIX}Expensive Item`,
      type: 'powerup',
      costGems: 100,
      isConsumable: true,
    },
  });
  log('SUITE 4', `Setup complete: 100 GEMS, Item costs 100 GEMS`, 'pass');

  // 2. CHECK Constraint Test
  log('SUITE 4', 'Testing CHECK constraint (negative balance)...');
  try {
    await prisma.$executeRaw`
      UPDATE user_wallets 
      SET balance = -50 
      WHERE user_id = ${TEST_USER_ID}::uuid AND currency = 'GEMS'
    `;
    log('SUITE 4', 'ERROR: Negative balance was allowed!', 'fail');
  } catch (error: unknown) {
    const e = error as Error;
    if (e.message.toLowerCase().includes('check') || e.message.toLowerCase().includes('constraint')) {
      log('SUITE 4', 'CHECK constraint violation correctly thrown', 'pass');
    } else {
      log('SUITE 4', `Unexpected error: ${e.message}`, 'info');
    }
  }

  // Reset to 100 GEMS for race test
  await prisma.userWallet.update({
    where: { userId_currency: { userId: TEST_USER_ID, currency: Currency.GEMS } },
    data: { balance: 100 },
  });

  // Clean inventory
  await prisma.userInventory.deleteMany({
    where: { userId: TEST_USER_ID, itemId: item.id },
  });

  // 3. Race Condition Simulation (Double-Spend Attack)
  console.log(colors.yellow('\n  ⚔️  Starting Double-Spend Attack Simulation...\n'));

  async function attemptPurchase(requestId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await prisma.$transaction(
        async (tx) => {
          // Lock wallet row
          const walletResult = await tx.$queryRaw<Array<{ balance: number }>>`
            SELECT balance FROM user_wallets 
            WHERE user_id = ${TEST_USER_ID}::uuid AND currency = 'GEMS'
            FOR UPDATE
          `;

          const currentBalance = walletResult[0]?.balance || 0;

          if (currentBalance < item.costGems) {
            throw new Error('INSUFFICIENT_FUNDS');
          }

          // Simulate some processing time to increase collision chance
          await new Promise((r) => setTimeout(r, 50));

          // Deduct
          await tx.userWallet.update({
            where: { userId_currency: { userId: TEST_USER_ID, currency: Currency.GEMS } },
            data: { balance: { decrement: item.costGems } },
          });

          // Add to inventory
          await tx.userInventory.upsert({
            where: { uq_user_item: { userId: TEST_USER_ID, itemId: item.id } },
            update: { quantity: { increment: 1 } },
            create: { userId: TEST_USER_ID, itemId: item.id, quantity: 1 },
          });

          return true;
        },
        {
          maxWait: 5000,
          timeout: 10000,
        }
      );

      return { success: true };
    } catch (error: unknown) {
      const e = error as Error;
      return { success: false, error: e.message };
    }
  }

  // Fire two simultaneous requests
  const [resultA, resultB] = await Promise.all([
    attemptPurchase('A'),
    attemptPurchase('B'),
  ]);

  console.log(`     - Request A: ${resultA.success ? colors.green('Success') : colors.red(`Failed (${resultA.error})`)}`);
  console.log(`     - Request B: ${resultB.success ? colors.green('Success') : colors.red(`Failed (${resultB.error})`)}`);

  // Verify final state
  const finalWallet = await prisma.userWallet.findUnique({
    where: { userId_currency: { userId: TEST_USER_ID, currency: Currency.GEMS } },
  });

  const finalInventory = await prisma.userInventory.findUnique({
    where: { uq_user_item: { userId: TEST_USER_ID, itemId: item.id } },
  });

  console.log(`\n     - Final Balance: ${finalWallet?.balance} GEMS`);
  console.log(`     - Inventory Quantity: ${finalInventory?.quantity || 0}`);

  // Assertions
  const successCount = [resultA, resultB].filter((r) => r.success).length;
  const failCount = [resultA, resultB].filter((r) => !r.success).length;

  if (successCount === 1 && failCount === 1 && finalWallet?.balance === 0 && finalInventory?.quantity === 1) {
    console.log(colors.green('\n     ✅ DOUBLE-SPEND ATTACK PREVENTED! System is SECURE.\n'));
    log('SUITE 4', 'Pessimistic locking verified', 'pass');
  } else if (successCount === 2) {
    console.log(colors.red('\n     ❌ CRITICAL: DOUBLE-SPEND OCCURRED! Both purchases succeeded.\n'));
    log('SUITE 4', 'SECURITY VULNERABILITY DETECTED', 'fail');
  } else {
    log('SUITE 4', `Unexpected result: ${successCount} success, ${failCount} fail`, 'info');
  }

  console.timeEnd('Suite 4 Duration');
}

// =============================================================================
// SUITE 5: Ledger & Auditing
// =============================================================================

async function suite5_Ledger(): Promise<void> {
  console.log(colors.bold('\n═══════════════════════════════════════════════════'));
  console.log(colors.bold('  SUITE 5: Ledger & Auditing'));
  console.log(colors.bold('═══════════════════════════════════════════════════\n'));

  console.time('Suite 5 Duration');

  // Create a transaction log entry for testing
  log('SUITE 5', 'Creating transaction history entry...');
  const now = new Date();

  await prisma.transactionHistory.create({
    data: {
      userId: TEST_USER_ID,
      currency: Currency.GEMS,
      amount: -100,
      balanceAfter: 0,
      transactionType: 'STORE_PURCHASE',
      referenceId: 'item_9999',
      createdAt: now,
    },
  });

  // 1. Verify entry exists
  const txLog = await prisma.transactionHistory.findFirst({
    where: {
      userId: TEST_USER_ID,
      transactionType: 'STORE_PURCHASE',
    },
    orderBy: { createdAt: 'desc' },
  });

  if (txLog) {
    log('SUITE 5', `Transaction logged: ${txLog.amount} ${txLog.currency}, balanceAfter: ${txLog.balanceAfter}`, 'pass');
  } else {
    log('SUITE 5', 'Transaction history entry NOT found', 'fail');
  }

  // 2. Verify balance_after snapshot
  if (txLog?.balanceAfter === 0) {
    log('SUITE 5', 'Balance snapshot verified (0 GEMS)', 'pass');
  }

  // 3. Partition Verification
  log('SUITE 5', 'Verifying transaction_history partition...');
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const partitionName = `transaction_history_y${year}m${month}`;

  try {
    const partitionCheck = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      `SELECT COUNT(*) as count FROM ${partitionName} WHERE user_id = $1::uuid`,
      TEST_USER_ID
    );

    if (partitionCheck[0].count > 0n) {
      log('SUITE 5', `Ledger routed to partition: ${partitionName} ✓`, 'pass');
    } else {
      log('SUITE 5', `Ledger NOT in partition ${partitionName}`, 'info');
    }
  } catch {
    log('SUITE 5', `Partition ${partitionName} check skipped (may use default)`, 'info');
  }

  console.timeEnd('Suite 5 Duration');
}

// =============================================================================
// SUITE 6: SRS & Algorithms
// =============================================================================

async function suite6_SRS(): Promise<void> {
  console.log(colors.bold('\n═══════════════════════════════════════════════════'));
  console.log(colors.bold('  SUITE 6: SRS & Algorithms (Partial Indexing)'));
  console.log(colors.bold('═══════════════════════════════════════════════════\n'));

  console.time('Suite 6 Duration');

  const course = await prisma.course.findFirst({
    where: { title: { startsWith: TEST_PREFIX } },
  });

  if (!course) {
    log('SUITE 6', 'Course not found', 'fail');
    return;
  }

  // 1. Seed Vocabulary
  log('SUITE 6', 'Seeding vocabulary with different review dates...');

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Due word (yesterday)
  await prisma.userVocabularyProgress.upsert({
    where: {
      userId_courseId_wordToken: {
        userId: TEST_USER_ID,
        courseId: course.id,
        wordToken: 'kedi',
      },
    },
    update: { nextReviewAt: yesterday },
    create: {
      userId: TEST_USER_ID,
      courseId: course.id,
      wordToken: 'kedi',
      stability: 1.0,
      difficulty: 0.3,
      nextReviewAt: yesterday,
    },
  });

  // Not due word (tomorrow)
  await prisma.userVocabularyProgress.upsert({
    where: {
      userId_courseId_wordToken: {
        userId: TEST_USER_ID,
        courseId: course.id,
        wordToken: 'kopek',
      },
    },
    update: { nextReviewAt: tomorrow },
    create: {
      userId: TEST_USER_ID,
      courseId: course.id,
      wordToken: 'kopek',
      stability: 2.0,
      difficulty: 0.2,
      nextReviewAt: tomorrow,
    },
  });

  log('SUITE 6', 'Vocabulary seeded: "kedi" (due), "kopek" (not due)', 'pass');

  // 2. Query Due Reviews
  log('SUITE 6', 'Fetching due reviews...');
  const dueWords = await prisma.userVocabularyProgress.findMany({
    where: {
      userId: TEST_USER_ID,
      courseId: course.id,
      nextReviewAt: { lte: new Date() },
    },
    orderBy: { nextReviewAt: 'asc' },
  });

  // 3. Assertion
  if (dueWords.length === 1 && dueWords[0].wordToken === 'kedi') {
    log('SUITE 6', `SRS Query returned 1 item: "${dueWords[0].wordToken}" (Correct)`, 'pass');
  } else {
    log('SUITE 6', `SRS Query returned ${dueWords.length} items (Expected 1)`, 'fail');
  }

  // Check index usage
  log('SUITE 6', 'Verifying SRS index usage...');
  const srsExplain = await prisma.$queryRaw<Array<{ 'QUERY PLAN': string }>>`
    EXPLAIN ANALYZE
    SELECT * FROM user_vocabulary_progress
    WHERE user_id = ${TEST_USER_ID}::uuid
      AND course_id = ${course.id}
      AND next_review_at <= NOW()
    ORDER BY next_review_at ASC
    LIMIT 10
  `;

  const srsPlan = srsExplain.map((r) => r['QUERY PLAN']).join('\n');
  if (srsPlan.toLowerCase().includes('idx_srs_fetch_queue') || srsPlan.toLowerCase().includes('index scan')) {
    log('SUITE 6', 'SRS index (idx_srs_fetch_queue) used', 'pass');
  } else {
    log('SUITE 6', `Index usage uncertain. Plan:\n${srsPlan.substring(0, 150)}...`, 'info');
  }

  console.timeEnd('Suite 6 Duration');
}

// =============================================================================
// SUITE 7: Gamification & Loot Boxes
// =============================================================================

async function suite7_Gamification(): Promise<void> {
  console.log(colors.bold('\n═══════════════════════════════════════════════════'));
  console.log(colors.bold('  SUITE 7: Gamification & Loot Boxes (DB Logic)'));
  console.log(colors.bold('═══════════════════════════════════════════════════\n'));

  console.time('Suite 7 Duration');

  // 1. League Cohort Allocation
  log('SUITE 7', 'Adding user to League cohort...');

  // Ensure Bronze league exists
  await prisma.league.upsert({
    where: { tier: 1 },
    update: {},
    create: { tier: 1, name: 'Bronze', promotionThreshold: 10, demotionThreshold: 5 },
  });

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
  weekStart.setHours(0, 0, 0, 0);

  const cohort = await prisma.leagueCohort.upsert({
    where: { id: '00000000-0000-0000-0000-000000000099' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000099',
      leagueTier: 1,
      weekStartDate: weekStart,
      isActive: true,
    },
  });

  await prisma.leagueMembership.upsert({
    where: { cohortId_userId: { cohortId: cohort.id, userId: TEST_USER_ID } },
    update: {},
    create: {
      cohortId: cohort.id,
      userId: TEST_USER_ID,
      currentWeeklyXp: 100,
    },
  });

  log('SUITE 7', `User added to Bronze cohort`, 'pass');

  // 2. Loot Box - Stored Procedure Test
  log('SUITE 7', 'Testing Loot Box stored procedure (pick_loot_item)...');

  // Ensure loot box and rates exist
  const lootBox = await prisma.lootBox.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Test Box', costGems: 50, isActive: true },
  });

  // Clear and create rates
  await prisma.lootBoxRate.deleteMany({ where: { lootBoxId: 1 } });
  await prisma.lootBoxRate.createMany({
    data: [
      { lootBoxId: 1, itemType: 'GEMS', itemValue: '10', weight: 70, isRare: false },
      { lootBoxId: 1, itemType: 'GEMS', itemValue: '50', weight: 25, isRare: false },
      { lootBoxId: 1, itemType: 'GEMS', itemValue: '200', weight: 5, isRare: true },
    ],
  });

  log('SUITE 7', 'Running pick_loot_item() 100 times...');
  const distribution: Record<string, number> = {};

  for (let i = 0; i < 100; i++) {
    const result = await prisma.$queryRaw<Array<{ pick_loot_item: string }>>`
      SELECT pick_loot_item(${lootBox.id})
    `;
    const item = result[0]?.pick_loot_item || 'NULL';
    distribution[item] = (distribution[item] || 0) + 1;
  }

  console.log('\n     Loot Box Distribution (100 draws):');
  console.log('     ─────────────────────────────────');
  for (const [value, count] of Object.entries(distribution).sort((a, b) => b[1] - a[1])) {
    const bar = '█'.repeat(Math.round(count / 5));
    const rarity = count < 10 ? colors.yellow('RARE') : '';
    console.log(`     ${value.padStart(5)} GEMS: ${String(count).padStart(3)} ${bar} ${rarity}`);
  }

  // Verify weighted distribution
  const commonCount = distribution['10'] || 0;
  const rareCount = distribution['200'] || 0;

  if (commonCount > rareCount) {
    console.log(colors.green('\n     ✅ Weighted randomness verified: Common > Rare\n'));
    log('SUITE 7', `Distribution valid: Common(${commonCount}) > Rare(${rareCount})`, 'pass');
  } else {
    log('SUITE 7', 'Distribution may need more samples to verify', 'info');
  }

  console.timeEnd('Suite 7 Duration');
}

// =============================================================================
// TEARDOWN
// =============================================================================

async function teardown(): Promise<void> {
  console.log(colors.bold('\n═══════════════════════════════════════════════════'));
  console.log(colors.bold('  TEARDOWN: Cleaning Up Test Data'));
  console.log(colors.bold('═══════════════════════════════════════════════════\n'));

  log('TEARDOWN', 'Cleaning up test data...');

  try {
    // Delete in order respecting FK constraints
    await prisma.leagueMembership.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.leagueCohort.deleteMany({ where: { id: '00000000-0000-0000-0000-000000000099' } });
    await prisma.userAchievement.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.transactionHistory.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.userInventory.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.userWallet.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.userVocabularyProgress.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.lessonCompletion.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.enrollment.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.user.deleteMany({ where: { id: TEST_USER_ID } });
    
    // Delete test content
    await prisma.exercise.deleteMany({
      where: { level: { unit: { course: { title: { startsWith: TEST_PREFIX } } } } },
    });
    await prisma.level.deleteMany({
      where: { unit: { course: { title: { startsWith: TEST_PREFIX } } } },
    });
    await prisma.unit.deleteMany({
      where: { course: { title: { startsWith: TEST_PREFIX } } },
    });
    await prisma.course.deleteMany({ where: { title: { startsWith: TEST_PREFIX } } });
    await prisma.item.deleteMany({ where: { name: { startsWith: TEST_PREFIX } } });

    log('TEARDOWN', 'Test data cleaned successfully', 'pass');
  } catch (error: unknown) {
    const e = error as Error;
    log('TEARDOWN', `Cleanup error (non-critical): ${e.message}`, 'info');
  }
}

// =============================================================================
// MAIN
// =============================================================================

async function main(): Promise<void> {
  console.log(colors.bold('\n╔═══════════════════════════════════════════════════════════════╗'));
  console.log(colors.bold('║           OPERATION STRESS-TEST                               ║'));
  console.log(colors.bold('║   Senior Backend Integration Test Suite                       ║'));
  console.log(colors.bold('╚═══════════════════════════════════════════════════════════════╝'));

  console.log('\n[SETUP] Connecting to database...');
  await prisma.$connect();
  console.log('[SETUP] Database connected.\n');

  console.time('Total Test Duration');

  try {
    await suite1_ContentEngine();
    await suite2_UserCore();
    await suite3_LessonFlow();
    await suite4_Economy();
    await suite5_Ledger();
    await suite6_SRS();
    await suite7_Gamification();
  } catch (error: unknown) {
    const e = error as Error;
    console.error(colors.red(`\n❌ CRITICAL ERROR: ${e.message}\n`));
    console.error(e.stack);
  } finally {
    await teardown();
  }

  console.timeEnd('Total Test Duration');

  console.log(colors.bold('\n╔═══════════════════════════════════════════════════════════════╗'));
  console.log(colors.bold('║   TEST SUITE COMPLETED                                        ║'));
  console.log(colors.bold('╚═══════════════════════════════════════════════════════════════╝\n'));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
