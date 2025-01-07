import { Controller, Get, Param } from '@nestjs/common';
import { BoardService } from './board.service';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from 'src/common/dto';
import { BoardResponseDto } from './dto';

@Controller('board')
export class BoardController {
  constructor(private readonly board: BoardService) {}

  @ApiOperation({ summary: '전체 게시물 목록 조회 API' })
  @ApiResponse({ type: [BoardResponseDto] })
  @Get()
  public async findAll(): Promise<BoardResponseDto[]> {
    return await this.board.findAll();
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
    return await this.board.findOne(boardId);
  }

  @ApiOperation({ summary: '구글 스프레드 시트에서 게시물 정보 강제 갱신(새로고침)' })
  @Get('/gss')
  public async forceRefreshBoardFromGSS(): Promise<SuccessResponseDto> {
    return { isSuccess: await this.board.getContentsFromGSS() };
  }
}
