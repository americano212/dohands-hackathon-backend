import { Controller, Get, Param, Post } from '@nestjs/common';
import { BoardService } from './board.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from 'src/common/dto';
import { BoardListResponseDto, BoardResponseDto } from './dto';
import { UserId } from 'src/common';

@Controller('board')
export class BoardController {
  constructor(private readonly board: BoardService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: '전체 게시물 목록 조회(읽음/안읽음 명시) API' })
  @ApiResponse({ type: [BoardListResponseDto] })
  @Get()
  public async findAll(@UserId() userId: number): Promise<BoardListResponseDto[]> {
    return await this.board.findAllByUserId(userId);
  }

  @ApiOperation({ summary: '게시물 1개 조회 API' })
  @ApiResponse({ type: BoardResponseDto })
  @ApiParam({
    name: 'board_id',
    required: true,
    example: 1,
    description: '1',
  })
  @Get('/:board_id')
  public async findOne(@Param('board_id') boardId: number): Promise<BoardResponseDto> {
    const board = await this.board.findOne(boardId);

    const result: BoardResponseDto = {
      boardId: board.boardId,
      createdAt: board.createdAt,
      title: board.title,
      content: board.content,
    };
    return result;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '게시물 1개 읽음 처리 API' })
  @ApiParam({
    name: 'board_id',
    required: true,
    example: 1,
    description: '1',
  })
  @Post('/:board_id/read')
  public async updateRead(
    @UserId() userId: number,
    @Param('board_id') boardId: number,
  ): Promise<SuccessResponseDto> {
    return { isSuccess: await this.board.setBoardRead(userId, boardId) };
  }

  @ApiOperation({ summary: '구글 스프레드 시트에서 게시물 정보 강제 갱신(새로고침)' })
  @Get('/gss')
  public async forceRefreshBoardFromGSS(): Promise<SuccessResponseDto> {
    return { isSuccess: await this.board.getContentsFromGSS() };
  }
}
