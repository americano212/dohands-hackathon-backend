import { ApiProperty } from '@nestjs/swagger';
import { JobQuestResponseDto } from './job-quest-res.dto';

export class JobQuestFullResponseDto {
  @ApiProperty({ example: '음성 1센터', description: '소속' })
  public department!: string;

  @ApiProperty({ example: 1, description: '직무 그룹' })
  public jobGroup!: number;

  @ApiProperty({ example: '생산성 향상', description: '퀘스트 이름' })
  public questName!: string;

  @ApiProperty({ example: '5번 연속 두둥 경험치 획득', description: '퀘스트 목표' })
  public questGoal!: string;

  @ApiProperty({ example: '5.1 이상', description: 'Max 달성 조건' })
  public maxCondition!: string;

  @ApiProperty({ example: '4.3 이상', description: 'Median 달성 조건' })
  public medianCondition!: string;

  @ApiProperty({ example: 80, description: 'Max 달성 시 획득하는 경험치' })
  public maxExp!: number;

  @ApiProperty({ example: 40, description: 'Median 달성 시 획득하는 경험치' })
  public medianExp!: number;

  @ApiProperty({ example: 40, description: '올해 총 획득한 경험치' })
  public totalExp!: number;

  @ApiProperty({ example: 'week', description: '주 : week, 월 : month' })
  public period!: string;

  @ApiProperty({ type: [JobQuestResponseDto], description: '직무별 퀘스트 결과 배열' })
  public jobQuestResponse!: JobQuestResponseDto[];
}
