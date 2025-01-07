import { Board } from '#entities/board.entity';
import { PickType } from '@nestjs/swagger';

export class UpdateBoardDto extends PickType(Board, ['title', 'content'] as const) {}
