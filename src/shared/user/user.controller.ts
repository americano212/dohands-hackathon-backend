import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { GetUserInfoResponseDto, UpdateUserDto } from './dto';
import { UserService } from './user.service';
import { SuccessResponseDto } from 'src/common/dto';
import { UserId } from 'src/common';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly user: UserService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: '유저(본인) 정보 불러오기' })
  @ApiResponse({ type: GetUserInfoResponseDto })
  @Get()
  public async getUserInfo(@UserId() userId: number): Promise<GetUserInfoResponseDto> {
    return await this.user.getUserInfo(userId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: '유저(본인)의 정보 업데이트 (PW, FCM Token, Profile 이미지(캐릭터), Profile Badge)',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ type: SuccessResponseDto })
  @ApiParam({
    name: 'field',
    description: '업데이트할 대상 지정',
    examples: {
      password: { summary: '비밀번호 업데이트', value: 'password' },
      fcmToken: { summary: 'FCM 디바이스 토큰 업데이트', value: 'fcm_token' },
      profileImageCode: { summary: '프로필 이미지(캐릭터) 업데이트', value: 'profile_image_code' },
      profileBadgeCode: { summary: '대표 Badge 업데이트', value: 'profile_badge_code' },
    },
  })
  @Patch(':field')
  public async updateUserInfo(
    @UserId() userId: number,
    @Param('field') field: string,
    @Body() updateData: UpdateUserDto,
  ): Promise<SuccessResponseDto> {
    const isSuccess = await this.user.updateField(userId, field, updateData);
    return { isSuccess };
  }

  @ApiOperation({ summary: '구글 스프레드 시트로 부터 유저정보 강제 갱신(새로고침)' })
  @Get('/gss')
  public async forceRefreshGetUserInfoFromGSS(): Promise<SuccessResponseDto> {
    return { isSuccess: await this.user.getUserInfoFromGSS() };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '로그아웃 API (디바이스 토큰 초기화)' })
  @Post('/logout')
  public async logout(@UserId() userId: number): Promise<SuccessResponseDto> {
    return { isSuccess: await this.user.clearFcmToken(userId) };
  }
}
