import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('test')
export class TestController {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async test() {
    return this.prisma.user.count();
  }
}