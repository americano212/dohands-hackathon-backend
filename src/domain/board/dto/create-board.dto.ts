import { Board } from '#entities/board.entity';
import { PickType } from '@nestjs/swagger';

export class CreateBoardDto extends PickType(Board, [
  'googleSheetId',
  'title',
  'content',
] as const) {}
