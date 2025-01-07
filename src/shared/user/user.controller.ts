import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { GiveRoleToUserDto, UpdateUserFCMDto, UpdateUserPasswordDto } from './dto';
import { UserService } from './user.service';
import { SuccessResponseDto } from 'src/common/dto';
import { Role, Roles, UserId } from 'src/common';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly user: UserService) {}

  @Roles(Role.SuperAdmin)
  @Post('role')
  public async giveRoleToUser(@Body() data: GiveRoleToUserDto): Promise<SuccessResponseDto> {
    return { isSuccess: await this.user.giveRole(data) };
  }

  @ApiBearerAuth() // JWT Token이 Header에 필수임의 의미(좌측 좌물쇠 표시)
  @ApiOperation({ summary: '유저의 PW 업데이트' })
  @ApiBody({ type: UpdateUserPasswordDto })
  @ApiResponse({ type: SuccessResponseDto })
  @Patch('password')
  public async updatePassword(
    @UserId() userId: number,
    @Body() updateUserdata: UpdateUserPasswordDto,
  ): Promise<SuccessResponseDto> {
    return { isSuccess: await this.user.update(userId, updateUserdata) };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '유저의 FCM 업데이트' })
  @ApiBody({ type: UpdateUserFCMDto })
  @ApiResponse({ type: SuccessResponseDto })
  @Patch('fcm_token')
  public async updateFCMToken(
    @UserId() userId: number,
    @Body() updateUserdata: UpdateUserFCMDto,
  ): Promise<SuccessResponseDto> {
    return { isSuccess: await this.user.update(userId, updateUserdata) };
  }

  @ApiOperation({ summary: '구글 스프레드 시트로 부터 유저정보 강제 갱신(새로고침)' })
  @Get('/gss')
  public async forceRefreshGetUserInfoFromGSS(): Promise<SuccessResponseDto> {
    return { isSuccess: await this.user.getUserInfoFromGSS() };
  }
}
