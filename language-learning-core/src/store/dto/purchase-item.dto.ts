import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for purchasing an item from the store.
 * PDF Reference: Page 18-19 (Purchase Logic)
 */
export class PurchaseItemDto {
  @ApiProperty({
    description: 'The ID of the item to purchase',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  itemId: number;
}
