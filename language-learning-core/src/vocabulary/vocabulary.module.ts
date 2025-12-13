import { Module } from '@nestjs/common';
import { VocabRepository } from './repositories';

/**
 * Vocabulary module for SRS operations.
 */
@Module({
  providers: [VocabRepository],
  exports: [VocabRepository],
})
export class VocabularyModule {}
