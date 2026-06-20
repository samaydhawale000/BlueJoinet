import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

import { JwtGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  signup(
    @Body() body: SignupDto,
  ) {
    return this.authService.signup(
      body.email,
      body.password,
    );
  }

  @Post('login')
  login(
    @Body() body: LoginDto,
  ) {
    return this.authService.login(
      body.email,
      body.password,
    );
  }

  @Post('refresh')
  refresh(
    @Body() body: RefreshDto,
  ) {
    return this.authService.refreshToken(
      body.refreshToken,
    );
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  logout(
    @Req() req: any,
  ) {
    return this.authService.logout(
      req.user.userId,
    );
  }
}