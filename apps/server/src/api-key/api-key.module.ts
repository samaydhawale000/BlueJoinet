import { Module } from '@nestjs/common';

import { ApiKeyController } from './controllers/api-key.controller';

import { ApiKeyService } from './services/api-key.service';

@Module({
  controllers: [
    ApiKeyController,
  ],

  providers: [
    ApiKeyService,
  ],

  exports: [
    ApiKeyService,
  ],
})
export class ApiKeyModule {}