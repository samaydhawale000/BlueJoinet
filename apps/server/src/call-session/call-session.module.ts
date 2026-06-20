import { Module } from '@nestjs/common';

import { CallSessionService } from './services/call-session.service';

@Module({
  providers: [
    CallSessionService,
  ],

  exports: [
    CallSessionService,
  ],
})
export class CallSessionModule {}