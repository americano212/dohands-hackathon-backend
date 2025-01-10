import { Controller, Get } from '@nestjs/common';
import { PerformanceService } from './providers/performance/performance.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PerformanceResponseDto } from './providers/performance/dto';
import { UserId } from 'src/common';
import { SuccessResponseDto } from 'src/common/dto';
import { CompanyQuestService, ExpService, JobQuestService } from './providers';
import { CompanyQuestResponseDto } from './providers/company-quest/dto/company-quest-res.dto';
import { JobQuestResponseDto } from './providers/job-quest/dto';
import { ExpStatusResponseDto } from './providers/dto';

@ApiTags('Exp')
@Controller('exp')
export class ExpController {
  constructor(
    private readonly companyQuest: CompanyQuestService,
    private readonly jobQuest: JobQuestService,
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

  @ApiBearerAuth()
  @ApiOperation({ summary: '올해 전사프로젝트 결과 조회 API [프로젝트1, 프로젝트2, ...]' })
  @ApiResponse({ type: [CompanyQuestResponseDto] })
  @Get('/company-quest')
  public async getCompanyQuest(@UserId() userId: number): Promise<CompanyQuestResponseDto[]> {
    return await this.companyQuest.getCompanyQuest(userId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: '올해 직무별 퀘스트 결과 조회 API [1년 전체 month 혹은 week에 해당하는 크기의 배열]',
  })
  @ApiResponse({ type: [JobQuestResponseDto] })
  @Get('/job-quest')
  public async getJobQuest(@UserId() userId: number): Promise<JobQuestResponseDto[]> {
    return await this.jobQuest.getJobQuest(userId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: '경험치 현황 조회 API',
  })
  @ApiResponse({ type: ExpStatusResponseDto })
  @Get('/status')
  public async getExpStatus(@UserId() userId: number): Promise<ExpStatusResponseDto> {
    return await this.exp.getExpStatus(userId);
  }

  @ApiOperation({ summary: '구글 스프레드 시트에서 퀘스트 정보 강제 갱신(새로고침)' })
  @Get('/gss')
  public async forceRefreshExpFromGss(): Promise<SuccessResponseDto> {
    return { isSuccess: await this.exp.getExpsFromGSS() };
  }
}
