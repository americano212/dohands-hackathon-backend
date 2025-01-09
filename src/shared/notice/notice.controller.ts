import { Body, Controller, Post } from '@nestjs/common';
import { NoticeService } from './providers';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { SendNoticeDto } from './providers/dto';

@Controller('notice')
export class NoticeController {
  constructor(private readonly notice: NoticeService) {}

  @ApiOperation({ summary: '[TEST] Push 알림 전송 테스트용 API' })
  @ApiBody({ type: SendNoticeDto })
  @Post()
  public async sendNotice(@Body() sendNoticeData: SendNoticeDto) {
    return await this.notice.sendNotice(sendNoticeData);
  }
}
