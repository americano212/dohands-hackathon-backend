import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { Board } from '#entities/board.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsRepository } from './board.repository';
import { UserBoard } from '#entities/user-board.entity';
import { UserBoardsRepository } from './user-board.repository';
import { UserModule } from 'src/shared/user/user.module';
import { NoticeModule } from 'src/shared/notice/notice.module';

@Module({
  imports: [TypeOrmModule.forFeature([Board, UserBoard]), UserModule, NoticeModule],
  controllers: [BoardController],
  providers: [BoardService, BoardsRepository, UserBoardsRepository],
  exports: [BoardService, BoardsRepository, UserBoardsRepository],
})
export class BoardModule {}
