import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(
    email: string,
    password: string,
  ) {
    const existingUser =
      await this.prisma.user.findUnique({
        where: { email },
      });

    if (existingUser) {
      throw new BadRequestException(
        'Email already exists',
      );
    }

    const passwordHash =
      await bcrypt.hash(password, 10);

    const user =
      await this.prisma.user.create({
        data: {
          email,
          passwordHash,
        },
      });

    const tokens =
      await this.generateTokens(user.id);

    await this.saveRefreshToken(
      user.id,
      tokens.refreshToken,
    );

    return {
      user,
      ...tokens,
    };
  }

  async login(
    email: string,
    password: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: { email },
      });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const isValid =
      await bcrypt.compare(
        password,
        user.passwordHash,
      );

    if (!isValid) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const tokens =
      await this.generateTokens(user.id);

    await this.saveRefreshToken(
      user.id,
      tokens.refreshToken,
    );

    return {
      user,
      ...tokens,
    };
  }

  private async generateTokens(
    userId: string,
  ) {
    const accessToken =
      await this.jwtService.signAsync(
        {
          sub: userId,
        },
        {
          secret:
            process.env.JWT_ACCESS_SECRET,
          expiresIn: '15m',
        },
      );

    const refreshToken =
      await this.jwtService.signAsync(
        {
          sub: userId,
        },
        {
          secret:
            process.env.JWT_REFRESH_SECRET,
          expiresIn: '30d',
        },
      );

    return {
      accessToken,
      refreshToken,
    };
  }

  private async saveRefreshToken(
    userId: string,
    refreshToken: string,
  ) {
    const hash =
      await bcrypt.hash(
        refreshToken,
        10,
      );

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshTokenHash: hash,
      },
    });
  }

  async refreshToken(
    refreshToken: string,
  ) {
    const payload =
      await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret:
            process.env.JWT_REFRESH_SECRET,
        },
      );

    const user =
      await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
      });

    if (!user) {
      throw new UnauthorizedException();
    }

    const valid =
      await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash || '',
      );

    if (!valid) {
      throw new UnauthorizedException();
    }

    const tokens =
      await this.generateTokens(user.id);

    await this.saveRefreshToken(
      user.id,
      tokens.refreshToken,
    );

    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshTokenHash: null,
      },
    });

    return {
      success: true,
    };
  }
}