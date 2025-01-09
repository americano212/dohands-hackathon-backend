import { UserBoard } from '#entities/user-board.entity';
import { PickType } from '@nestjs/swagger';

export class CreateUserBoardDto extends PickType(UserBoard, ['isRead', 'user', 'board'] as const) {}
