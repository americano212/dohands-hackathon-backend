import { Board } from '#entities/board.entity';
import { PickType } from '@nestjs/swagger';

export class BoardResponseDto extends PickType(Board, [
  'boardId',
  'createdAt',
  'title',
  'content',
] as const) {}
