import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { Board } from '#entities/board.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsRepository } from './board.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Board])],
  controllers: [BoardController],
  providers: [BoardService, BoardsRepository],
  exports: [BoardService, BoardsRepository],
})
export class BoardModule {}
