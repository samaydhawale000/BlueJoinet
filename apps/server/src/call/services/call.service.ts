import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CallSessionService } from '../../call-session/services/call-session.service';

import {
  CallStatus,
  CallType,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CallService {
  constructor(
    private prisma: PrismaService,
     private callSessionService: CallSessionService,
  ) {}

async createCall(data: {
  projectId: string;
  callerId: string;
  receiverId: string;
  type: CallType;
}) {
  const call =
    await this.prisma.call.create({
      data: {
        projectId: data.projectId,
        callerId: data.callerId,
        receiverId: data.receiverId,
        type: data.type,
        status: CallStatus.RINGING,
      },
    });

  await this.prisma.callEvent.create({
    data: {
      callId: call.id,
      event: 'CALL_CREATED',
    },
  });

  const session =
    await this.callSessionService.createSession(
      call.id,
    );

  return {
    call,

    callerToken:
      session.callerToken,

    receiverToken:
      session.receiverToken,
  };
}

  async acceptCall(callId: string) {
    const call =
      await this.prisma.call.findUnique({
        where: {
          id: callId,
        },
      });

    if (!call) {
      throw new NotFoundException(
        'Call not found',
      );
    }

    const updated =
      await this.prisma.call.update({
        where: {
          id: callId,
        },
        data: {
          status: CallStatus.ACCEPTED,
          startedAt: new Date(),
        },
      });

    await this.prisma.callEvent.create({
      data: {
        callId,
        event: 'CALL_ACCEPTED',
      },
    });

    return updated;
  }

  async rejectCall(callId: string) {
    const updated =
      await this.prisma.call.update({
        where: {
          id: callId,
        },
        data: {
          status: CallStatus.REJECTED,
        },
      });

    await this.prisma.callEvent.create({
      data: {
        callId,
        event: 'CALL_REJECTED',
      },
    });

    return updated;
  }

  async endCall(callId: string) {
    const updated =
      await this.prisma.call.update({
        where: {
          id: callId,
        },
        data: {
          status: CallStatus.ENDED,
          endedAt: new Date(),
        },
      });

    await this.prisma.callEvent.create({
      data: {
        callId,
        event: 'CALL_ENDED',
      },
    });

    return updated;
  }

  async getCalls(projectId: string) {
    return this.prisma.call.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}