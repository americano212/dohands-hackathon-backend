import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppPushMessageDto, AppPushMessageResponseDto } from './common/providers/app-push/dto';
import { AppPushService } from './common/providers/app-push/app-push.service';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appPush: AppPushService) {}
  @Get()
  healthCheck(): string {
    return 'Health Check 200!';
  }

  @ApiOperation({ summary: '[TEST] FCM 테스트용 API' })
  @ApiBody({ type: AppPushMessageDto })
  @Post('/fcm')
  public async getFromGoogleSheet(
    @Body() messgae: AppPushMessageDto,
  ): Promise<AppPushMessageResponseDto> {
    return await this.appPush.sendPushMessage(messgae);
  }
}
