import { Injectable } from '@nestjs/common';

import { randomBytes } from 'crypto';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async createProject(
  ownerId: string,
  data: {
    name: string;
    description?: string;
  },
) {
  return this.prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      ownerId,
    },
  });
}
  async getProjects(ownerId: string) {
    return this.prisma.project.findMany({
      where: {
        ownerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}