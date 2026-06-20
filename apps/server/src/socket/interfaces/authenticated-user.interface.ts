export interface AuthenticatedUser {
  socketId: string;

  callId: string;

  userId: string;

  role: 'CALLER' | 'RECEIVER';
}