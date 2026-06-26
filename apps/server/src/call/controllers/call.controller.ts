import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ApiKeyGuard } from '../../common/guards/api-key.guard';

import { CallService } from '../services/call.service';

import { CreateCallDto } from '../dto/create-call.dto';

@Controller('calls')
@UseGuards(ApiKeyGuard)
export class CallController {
  constructor(
    private callService: CallService,
  ) {}

  @Post()
  create(
    @Req() req: any,

    @Body()
    body: CreateCallDto,
  ) {
    return this.callService.createCall({
      ...body,

      projectId:
        req.project.id,
    });
  }

  @Post(':id/accept')
  accept(
    @Param('id')
    id: string,
  ) {
    return this.callService.acceptCall(id);
  }

  @Post(':id/reject')
  reject(
    @Param('id')
    id: string,
  ) {
    return this.callService.rejectCall(id);
  }

  @Post(':id/end')
  end(
    @Param('id')
    id: string,
  ) {
    return this.callService.endCall(id);
  }

  @Get()
  getCalls(
    @Req() req: any,
  ) {
    return this.callService.getCalls(
      req.project.id,
    );
  }
}