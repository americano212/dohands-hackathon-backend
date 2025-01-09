import { Controller, Get } from '@nestjs/common';
import { PerformanceService } from './providers/performance/performance.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PerformanceResponseDto } from './providers/performance/dto';
import { UserId } from 'src/common';
import { SuccessResponseDto } from 'src/common/dto';
import { ExpService } from './providers';

@ApiTags('Exp')
@Controller('exp')
export class ExpController {
  constructor(
    private readonly performance: PerformanceService,
    private readonly exp: ExpService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: '올해 인사평가 결과 조회 API [상반기, 하반기]' })
  @ApiResponse({ type: [PerformanceResponseDto] })
  @Get('/performance')
  public async getPerformance(@UserId() userId: number): Promise<PerformanceResponseDto[]> {
    return await this.performance.getPerformance(userId);
  }

  @ApiOperation({ summary: '구글 스프레드 시트에서 퀘스트 정보 강제 갱신(새로고침)' })
  @Get('/gss')
  public async forceRefreshExpFromGss(): Promise<SuccessResponseDto> {
    return { isSuccess: await this.exp.getExpsFromGSS() };
  }
}
