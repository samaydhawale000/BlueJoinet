import { Module } from '@nestjs/common';

import { CallController } from './controllers/call.controller';
import { CallService } from './services/call.service';
import { CallSessionModule } from '../call-session/call-session.module';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [
    CallSessionModule,
    SocketModule,
  ],
  controllers: [CallController],
  providers: [CallService],
})
export class CallModule {}
