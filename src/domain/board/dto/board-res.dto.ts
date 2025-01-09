import { Board } from '#entities/board.entity';
import { UserBoard } from '#entities/user-board.entity';
import { IntersectionType, PickType } from '@nestjs/swagger';

export class BoardResponseDto extends PickType(Board, [
  'boardId',
  'createdAt',
  'title',
  'content',
] as const) {}

export class BoardListResponseDto extends IntersectionType(
  BoardResponseDto,
  PickType(UserBoard, ['isRead'] as const),
) {}
