import { Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService, LocalLoginGuard, Payload } from '../../auth';
import { LocalLoginDto, LocalLoginResponseDto } from '../dto';
import { ReqUser } from '../../common';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @ApiOperation({ summary: '로그인, 관리자가 부여한 ID/PW 입력' }) // swagger API 소개 작성
  @ApiBody({ type: LocalLoginDto }) // swagger 입력 양식 작성
  @ApiResponse({ type: LocalLoginResponseDto }) // swagger 출력 양식 작성
  @HttpCode(HttpStatus.OK) // HttpCode 200으로 고정 (NestJS에서 POST 쓰면 기본이 201)
  @Post('login')
  @UseGuards(LocalLoginGuard) // login은 Guard에서 request를 확인하고 변환 시킴
  public async localLogin(@ReqUser() user: Payload): Promise<LocalLoginResponseDto> {
    const { accessToken } = await this.auth.jwtSign(user);
    return { accessToken: accessToken };
  }
}
