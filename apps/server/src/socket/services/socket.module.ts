import { Module } from '@nestjs/common';

import { CallGateway } from '../gateways/call.gateway';

import { CallRoomService } from '../services/call-room.service';
import { CallSessionModule } from 'src/call-session/call-session.module';


@Module({
  imports: [
    CallSessionModule,
  ],

  providers: [
    CallGateway,
    CallRoomService,
  ],

  exports: [
    CallGateway,
    CallRoomService,
  ],
})
export class SocketModule {}