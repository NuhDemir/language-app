import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto';

/**
 * Authentication Service.
 * Handles user registration, login, and token generation.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user.
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log(`Registering new user: ${dto.email}`);

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new UnauthorizedException('Email already registered');
      }
      throw new UnauthorizedException('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
      },
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email);

    this.logger.log(`User registered successfully: ${user.id}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      ...tokens,
    };
  }

  /**
   * Login with email and password.
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    this.logger.log(`Login attempt for: ${dto.email}`);

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      this.logger.warn(`Login failed - user not found: ${dto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      this.logger.warn(`Login failed - invalid password: ${dto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email);

    this.logger.log(`User logged in successfully: ${user.id}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      ...tokens,
    };
  }

  /**
   * Validate user exists (used by JwtStrategy).
   */
  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        totalXp: true,
        streakDays: true,
      },
    });
  }

  /**
   * Generate access and refresh tokens.
   */
  private generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
    };
  }
}
