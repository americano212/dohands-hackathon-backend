import { Body, Controller, Get, Post } from '@nestjs/common';
import { NoticeService } from './providers';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetNoticeListDto, SendNoticeDto } from './providers/dto';
import { AppPushService, UserId } from 'src/common';
import { AppPushMessageDto, AppPushMessageResponseDto } from 'src/common/providers/app-push/dto';
import { SuccessResponseDto } from 'src/common/dto';

@Controller('notice')
export class NoticeController {
  constructor(
    private readonly notice: NoticeService,
    private readonly appPush: AppPushService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: '유저(본인)에게 온 모든 Notice 목록 조회 API' })
  @ApiResponse({ type: GetNoticeListDto })
  @Get()
  public async getNoticeList(@UserId() userId: number): Promise<GetNoticeListDto> {
    return await this.notice.noticeListByUserId(userId);
  }

  @ApiOperation({ summary: '[TEST] Push 알림 전송 테스트용 API' })
  @ApiBody({ type: SendNoticeDto })
  @Post()
  public async sendNotice(@Body() sendNoticeData: SendNoticeDto): Promise<SuccessResponseDto> {
    return { isSuccess: await this.notice.sendNotice(sendNoticeData) };
  }

  @ApiOperation({ summary: '[TEST] FCM 디바이스 토큰 테스트용 API' })
  @ApiBody({ type: AppPushMessageDto })
  @Post('/fcm')
  public async getFromGoogleSheet(
    @Body() messgae: AppPushMessageDto,
  ): Promise<AppPushMessageResponseDto> {
    return await this.appPush.sendPushMessage(messgae);
  }
}
