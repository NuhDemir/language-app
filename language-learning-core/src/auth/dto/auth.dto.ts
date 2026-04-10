import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for user login.
 */
export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SecureP@ss123',
    description: 'User password (min 8 characters)',
  })
  @IsString()
  @MinLength(8)
  password: string;
}

/**
 * DTO for user registration.
 */
export class RegisterDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'Unique username (3-30 characters, alphanumeric)',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SecureP@ss123',
    description: 'Password (min 8 characters)',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}

/**
 * Response DTO for authentication.
 */
export class AuthResponseDto {
  user: {
    id: string;
    email: string;
    username: string;
  };
  accessToken: string;
  refreshToken: string;
}
