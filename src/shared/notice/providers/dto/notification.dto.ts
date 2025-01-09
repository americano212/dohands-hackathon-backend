import { Notice } from '#entities/notice.entity';
import { PickType } from '@nestjs/swagger';

export class Notification extends PickType(Notice, ['title', 'body'] as const) {}
