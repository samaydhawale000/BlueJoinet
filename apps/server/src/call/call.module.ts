import { Module } from '@nestjs/common';

import { CallController } from './controllers/call.controller';

import { CallService } from './services/call.service';

import { CallSessionModule } from '../call-session/call-session.module';

@Module({
  imports: [
    CallSessionModule,
  ],

  controllers: [
    CallController,
  ],

  providers: [
    CallService,
  ],
})
export class CallModule {}