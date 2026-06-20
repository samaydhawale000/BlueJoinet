import { Injectable } from '@nestjs/common';

import { randomBytes } from 'crypto';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ApiKeyService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async createApiKey(
    projectId: string,
    name: string,
  ) {
    const apiKey =
      'bj_live_' +
      randomBytes(32).toString('hex');

    return this.prisma.apiKey.create({
      data: {
        key: apiKey,
        name,
        projectId,
      },
    });
  }

  async getProjectKeys(
    projectId: string,
  ) {
    return this.prisma.apiKey.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}