import { ApiProperty, PickType } from '@nestjs/swagger';
import { Notice } from '#entities/notice.entity';

export class GetNoticeDto extends PickType(Notice, ['title', 'body', 'createdAt'] as const) {}

export class GetNoticeListDto {
  @ApiProperty({
    type: [GetNoticeDto],
    description: '푸시 알림 데이터 리스트 (알림 제목, 알림 세부내용, 생성시간)',
  })
  public noticeList!: GetNoticeDto[];
}
