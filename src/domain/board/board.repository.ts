import { Board } from '#entities/board.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBoardDto, UpdateBoardDto } from './dto';
import { NullableType } from 'src/common/types';

@Injectable()
export class BoardsRepository {
  constructor(@InjectRepository(Board) private boardsRepository: Repository<Board>) {}

  public async findAll(): Promise<Board[]> {
    return await this.boardsRepository.find();
  }

  public async findOne(boardId: number): Promise<NullableType<Board>> {
    return await this.boardsRepository.findOne({
      where: { boardId },
    });
  }

  public async create(createBoardData: CreateBoardDto): Promise<Board> {
    return await this.boardsRepository.save(await this.boardsRepository.create(createBoardData));
  }

  public async updateByGoogleSheetId(
    googleSheetId: string,
    updateBoardDate: UpdateBoardDto,
  ): Promise<boolean> {
    const result = await this.boardsRepository.update(
      { googleSheetId: googleSheetId },
      updateBoardDate,
    );
    return result.affected ? true : false;
  }

  public async isExistGoogleSheetId(googleSheetId: string): Promise<boolean> {
    return await this.boardsRepository.exists({ where: { googleSheetId: googleSheetId } });
  }

  public async findAllByUserId(userId: number): Promise<Board[]> {
    const boards = await this.boardsRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.userBoards', 'userBoard', 'userBoard.user_id = :userId', { userId })
      .leftJoinAndSelect('userBoard.user', 'user')
      .orderBy('board.createdAt', 'DESC')
      .getMany();
    return boards;
  }
}
