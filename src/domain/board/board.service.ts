import { Injectable, NotFoundException } from '@nestjs/common';
import { BoardsRepository } from './board.repository';
import { GoogleSheetService } from 'src/common';
import { BoardFromGSSDto, BoardListResponseDto } from './dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserService } from 'src/shared/user/user.service';
import { UserBoardsRepository } from './user-board.repository';
import { Board } from '#entities/board.entity';
import { Transactional } from 'typeorm-transactional';
import { NoticeService } from 'src/shared/notice/providers';
import { SendNoticeDto } from 'src/shared/notice/providers/dto';

@Injectable()
export class BoardService {
  constructor(
    private readonly boardsRepository: BoardsRepository,
    private readonly userBoardsRepository: UserBoardsRepository,
    private readonly user: UserService,
    private readonly gssService: GoogleSheetService,
    private readonly notice: NoticeService,
  ) {}

  @Transactional()
  public async findAllByUserId(userId: number): Promise<BoardListResponseDto[]> {
    const user = await this.user.findOne(userId);
    const boards = await this.boardsRepository.findAllByUserId(user.userId);

    const result: BoardListResponseDto[] = [];
    boards.forEach((board) => {
      if (!board.userBoards) board.userBoards = [];
      result.push({
        boardId: board.boardId,
        createdAt: board.createdAt,
        title: board.title,
        content: board.content,
        isRead: board.userBoards.length !== 0 ? true : false,
      });
    });
    return result;
  }

  public async findOne(boardId: number): Promise<Board> {
    const board = await this.boardsRepository.findOne(boardId);
    if (!board) throw new NotFoundException(`Board ID ${boardId} Not Found`);
    return board;
  }

  @Transactional()
  public async setBoardRead(userId: number, boardId: number): Promise<boolean> {
    const isAlreadyRead = await this.userBoardsRepository.isExist(userId, boardId);
    if (isAlreadyRead) return true; // 이미 읽은 경우 판정

    const user = await this.user.findOne(userId);
    const board = await this.findOne(boardId);
    const result = await this.userBoardsRepository.setIsReadTrue(user, board);
    return result ? true : false;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  @Transactional()
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
        const userIdList = await this.user.findAllUserId(); // 전체 UserId 불러오기
        const sendNoticeData: SendNoticeDto = {
          userIdList,
          title: '새로운 글이 게시되었습니다!',
          body: '게시판을 통해 글을 확인해 보세요.',
        };
        await this.notice.sendNotice(sendNoticeData);
      }
    }

    return true;
  }
}
