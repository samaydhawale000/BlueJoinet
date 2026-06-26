import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { CallRoomService } from '../services/call-room.service';

import { CallSessionService } from '../../call-session/services/call-session.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly callSessionService: CallSessionService,
    private readonly roomService: CallRoomService,
  ) {}

  @WebSocketServer()
  server: Server;

  private authenticatedSockets = new Map<
    string,
    {
      socketId: string;
      callId: string;
      role: 'CALLER' | 'RECEIVER';
      token: string;
    }
  >();

  private getParticipantBySocketId(socketId: string) {
    for (const participant of this.authenticatedSockets.values()) {
      if (participant.socketId === socketId) {
        return participant;
      }
    }
    return null;
  }

  private getOtherParticipant(senderSocketId: string) {
    const sender = this.getParticipantBySocketId(senderSocketId);
    if (!sender) return null;

    for (const participant of this.authenticatedSockets.values()) {
      if (
        participant.callId === sender.callId &&
        participant.socketId !== senderSocketId
      ) {
        return participant;
      }
    }
    return null;
  }

  emitToParticipant(
    callId: string,
    role: 'CALLER' | 'RECEIVER',
    event: string,
    data: any,
  ) {
    for (const participant of this.authenticatedSockets.values()) {
      if (participant.callId === callId && participant.role === role) {
        this.server.to(participant.socketId).emit(event, data);
        return;
      }
    }
  }

  handleConnection(client: Socket) {
    console.log('Socket Connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    for (const roomId of [...this.server.sockets.adapter.rooms.keys()]) {
      this.roomService.leaveRoom(roomId, client.id);
    }
    for (const [token, session] of this.authenticatedSockets.entries()) {
      if (session.socketId === client.id) {
        this.authenticatedSockets.delete(token);
      }
    }
    console.log('Socket Disconnected:', client.id);
  }

  @SubscribeMessage('authenticate')
  async authenticate(
    @ConnectedSocket()
    client: Socket,

    @MessageBody()
    body: {
      token: string;
    },
  ) {
    const caller = await this.callSessionService.getByCallerToken(body.token);

    if (caller) {
      this.authenticatedSockets.set(body.token, {
        socketId: client.id,
        callId: caller.call.id,
        role: 'CALLER',
        token: body.token,
      });

      return { success: true, role: 'CALLER' };
    }

    const receiver = await this.callSessionService.getByReceiverToken(
      body.token,
    );

    if (receiver) {
      this.authenticatedSockets.set(body.token, {
        socketId: client.id,
        callId: receiver.call.id,
        role: 'RECEIVER',
        token: body.token,
      });

      client.emit('incoming-call', {
        callId: receiver.call.id,
        callerId: receiver.call.callerId,
        type: receiver.call.type,
      });

      return { success: true, role: 'RECEIVER' };
    }

    return { success: false };
  }

  @SubscribeMessage('offer')
  async offer(
    @ConnectedSocket()
    client: Socket,

    @MessageBody()
    body: {
      offer: RTCSessionDescriptionInit;
    },
  ) {
    const target = this.getOtherParticipant(client.id);
    if (!target) return;
    this.server.to(target.socketId).emit('offer', { offer: body.offer });
  }

  @SubscribeMessage('answer')
  async answer(
    @ConnectedSocket()
    client: Socket,

    @MessageBody()
    body: {
      answer: RTCSessionDescriptionInit;
    },
  ) {
    const target = this.getOtherParticipant(client.id);
    if (!target) return;
    this.server.to(target.socketId).emit('answer', { answer: body.answer });
  }

  @SubscribeMessage('ice-candidate')
  async iceCandidate(
    @ConnectedSocket()
    client: Socket,

    @MessageBody()
    body: {
      candidate: RTCIceCandidateInit;
    },
  ) {
    const target = this.getOtherParticipant(client.id);
    if (!target) return;
    this.server
      .to(target.socketId)
      .emit('ice-candidate', { candidate: body.candidate });
  }

  @SubscribeMessage('call-ended')
  async callEnded(
    @ConnectedSocket()
    client: Socket,
  ) {
    const target = this.getOtherParticipant(client.id);
    if (!target) return;
    this.server.to(target.socketId).emit('call-ended');
  }

  @SubscribeMessage('join-call')
  async joinCall(
    @ConnectedSocket()
    client: Socket,

    @MessageBody()
    body: {
      callId: string;
    },
  ) {
    const participant = this.getParticipantBySocketId(client.id);

    if (!participant) {
      return { success: false, error: 'Not authenticated' };
    }

    if (participant.callId !== body.callId) {
      return { success: false, error: 'Call access denied' };
    }

    client.join(body.callId);
    this.roomService.joinRoom(body.callId, client.id);

    const count = this.roomService.getParticipantCount(body.callId);
    this.server.to(body.callId).emit('participant-joined', { participants: count });

    return { success: true, participants: count };
  }

  @SubscribeMessage('leave-call')
  async leaveCall(
    @ConnectedSocket()
    client: Socket,

    @MessageBody()
    body: {
      callId: string;
    },
  ) {
    client.leave(body.callId);
    this.roomService.leaveRoom(body.callId, client.id);

    const count = this.roomService.getParticipantCount(body.callId);
    this.server.to(body.callId).emit('participant-left', { participants: count });
  }
}
