import { Board } from '#entities/board.entity';
import { UserBoard } from '#entities/user-board.entity';
import { User } from '#entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserBoardDto } from './dto';

@Injectable()
export class UserBoardsRepository {
  constructor(@InjectRepository(UserBoard) private userBoardsRepository: Repository<UserBoard>) {}

  public async setIsReadTrue(user: User, board: Board): Promise<UserBoard> {
    const userBoard: CreateUserBoardDto = { user, board, isRead: true };
    return await this.userBoardsRepository.save(await this.userBoardsRepository.create(userBoard));
  }

  public async isExist(userId: number, boardId: number): Promise<boolean> {
    return await this.userBoardsRepository.exists({
      where: { user: { userId }, board: { boardId } },
    });
  }
}
