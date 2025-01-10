import { Notice } from '#entities/notice.entity';
import { PickType } from '@nestjs/swagger';

export class CreateNoticeDto extends PickType(Notice, ['title', 'body', 'user'] as const) {}
