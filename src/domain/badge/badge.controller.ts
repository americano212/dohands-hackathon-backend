import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { UserId } from 'src/common';
import { SuccessResponseDto } from 'src/common/dto';
import { BadgeService } from './badge.service';
import { GiveBadgeToUserDto } from './dto';

@Controller('badge')
export class BadgeController {
  constructor(private readonly badge: BadgeService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: '[TEST] 특정 유저에게 badge 임의 부여 API' })
  @ApiBody({ type: GiveBadgeToUserDto })
  @Post()
  public async giveBadgeToUser(
    @UserId() userId: number,
    @Body() giveBadgeToUserData: GiveBadgeToUserDto,
  ): Promise<SuccessResponseDto> {
    return { isSuccess: await this.badge.giveBadgeToUser(userId, giveBadgeToUserData.badgeCode) };
  }
}
