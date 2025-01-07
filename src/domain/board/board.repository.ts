import { Board } from '#entities/board.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BoardsRepository {
  constructor(@InjectRepository(Board) private boardsRepository: Repository<Board>) {}
}
