import { Injectable } from '@nestjs/common';

@Injectable()
export class CallRoomService {
  private rooms = new Map<
    string,
    Set<string>
  >();

  joinRoom(
    callId: string,
    socketId: string,
  ) {
    if (
      !this.rooms.has(callId)
    ) {
      this.rooms.set(
        callId,
        new Set(),
      );
    }

    this.rooms
      .get(callId)!
      .add(socketId);
  }

  leaveRoom(
    callId: string,
    socketId: string,
  ) {
    const room =
      this.rooms.get(callId);

    if (!room) return;

    room.delete(socketId);

    if (room.size === 0) {
      this.rooms.delete(callId);
    }
  }

  getParticipantCount(
    callId: string,
  ) {
    return (
      this.rooms.get(callId)
        ?.size || 0
    );
  }

  hasRoom(callId: string) {
    return this.rooms.has(callId);
  }
}