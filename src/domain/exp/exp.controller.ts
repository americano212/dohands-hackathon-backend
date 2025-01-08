import { Controller, Get } from '@nestjs/common';
import { PerformanceService } from './providers/performance/performance.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PerformanceResponseDto } from './providers/performance/dto';
import { UserId } from 'src/common';
import { NullableType } from 'src/common/types';
@Controller('exp')
export class ExpController {
  constructor(private readonly performance: PerformanceService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: '올해 인사평가 결과 조회 API [상반기, 하반기]' })
  @ApiResponse({ type: [PerformanceResponseDto] })
  @Get()
  public async getPerformance(
    @UserId() userId: number,
  ): Promise<NullableType<PerformanceResponseDto>[]> {
    return await this.performance.getPerformance(userId);
  }
}
