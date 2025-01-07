import { Controller, Get } from '@nestjs/common';
import { BoardService } from './board.service';
import { ApiOperation } from '@nestjs/swagger';
import { SuccessResponseDto } from 'src/common/dto';
import { BoardResponseDto } from './dto';

@Controller('board')
export class BoardController {
  constructor(private readonly board: BoardService) {}

  @ApiOperation({ summary: '전체 게시물 목록 조회 API' })
  @Get()
  public async findAll(): Promise<BoardResponseDto[]> {
    return await this.board.findAll();
  }

  @ApiOperation({ summary: '구글 스프레드 시트에서 게시물 정보 강제 갱신(새로고침)' })
  @Get('/gss')
  public async forceRefreshBoardFromGSS(): Promise<SuccessResponseDto> {
    return { isSuccess: await this.board.getContentsFromGSS() };
  }
}
