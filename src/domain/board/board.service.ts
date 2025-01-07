import { Injectable } from '@nestjs/common';
import { BoardsRepository } from './board.repository';
import { GoogleSheetService } from 'src/common';
import { BoardFromGSSDto, BoardResponseDto } from './dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BoardService {
  constructor(
    private readonly boardsRepository: BoardsRepository,
    private readonly gssService: GoogleSheetService,
  ) {}

  public async findAll(): Promise<BoardResponseDto[]> {
    const boards = await this.boardsRepository.findAll();
    const result: BoardResponseDto[] = [];
    boards.forEach((board) => {
      result.push({
        boardId: board.boardId,
        createdAt: board.createdAt,
        title: board.title,
        content: board.content,
      });
    });
    return result;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  public async getContentsFromGSS(): Promise<boolean> {
    const tabName = 'notice_board';
    const range = 'C7:D100'; // TODO 레거시
    const values = await this.gssService.getValueFromSheet({ tabName, range });

    for (let idx = 0; idx < values.length; idx++) {
      const value = values[idx];
      if (value[0] === '') continue; // No title
      if (value[1] === '') continue; // No content

      const board: BoardFromGSSDto = {
        googleSheetId: `${idx + 7}`,
        title: value[0],
        content: value[1],
      };

      const isExist = await this.boardsRepository.isExistGoogleSheetId(board.googleSheetId);

      if (isExist) {
        // ! 있었는데 아예 지워져버리는 경우는 제외됨(삭제 불가)
        // 이미 존재할 때는 글 내용만 업데이트
        await this.boardsRepository.updateByGoogleSheetId(board.googleSheetId, {
          title: board.title,
          content: board.content,
        });
      } else {
        // 새로운 글일 때는 추가 및 FCM push 알림
        await this.boardsRepository.create(board);
        // TODO FCM 연결
        console.log('Mock FCM Alert~!');
      }
    }

    return true;
  }
}
