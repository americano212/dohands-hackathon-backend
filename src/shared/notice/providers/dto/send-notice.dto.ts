import { Notice } from '#entities/notice.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';

export class SendNoticeDto extends PickType(Notice, ['title', 'body'] as const) {
  @ApiProperty({ example: [1, 2, 4], description: '메시지 전송대상 userId' })
  public userIdList!: number[];

  @ApiProperty({ example: 'DB에 저장될 내용입니다', description: 'DB에 저장될 내용' })
  public saveBody?: string;
}
