import { Injectable } from '@nestjs/common';

import { randomBytes } from 'crypto';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CallSessionService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async createSession(
    callId: string,
  ) {
    const callerToken =
      'bj_session_' +
      randomBytes(32).toString('hex');

    const receiverToken =
      'bj_session_' +
      randomBytes(32).toString('hex');

    const expiresAt =
      new Date(
        Date.now() +
          1000 *
            60 *
            60 *
            24,
      );

    return this.prisma.callSession.create({
      data: {
        callId,
        callerToken,
        receiverToken,
        expiresAt,
      },
    });
  }

  async getByCallerToken(
    token: string,
  ) {
    return this.prisma.callSession.findFirst({
      where: {
        callerToken: token,
      },
      include: {
        call: true,
      },
    });
  }

  async getByReceiverToken(
    token: string,
  ) {
    return this.prisma.callSession.findFirst({
      where: {
        receiverToken: token,
      },
      include: {
        call: true,
      },
    });
  }
}