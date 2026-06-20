import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtGuard } from '../../auth/guards/jwt.guard';

import { ApiKeyService } from '../services/api-key.service';

import { CreateApiKeyDto } from '../dto/create-api-key.dto';

@Controller('api-keys')
@UseGuards(JwtGuard)
export class ApiKeyController {
  constructor(
    private apiKeyService: ApiKeyService,
  ) {}

  @Post()
  create(
    @Body()
    body: CreateApiKeyDto,
  ) {
    return this.apiKeyService.createApiKey(
      body.projectId,
      body.name,
    );
  }

  @Get(':projectId')
  getKeys(
    @Param('projectId')
    projectId: string,
  ) {
    return this.apiKeyService.getProjectKeys(
      projectId,
    );
  }
}