import { Exp } from '#entities/exp.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';

//exp 전체 조회할 때 사용
export class LeaderQuestResponseDto extends PickType(Exp, ['exp', 'achieveGrade'] as const) {
  @ApiProperty({
    example: 1,
    description: 'period가 week인 경우에는 주차, month인 경우에는 월',
  })
  public index!: number;
}

export class QuestInfo {
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

  @ApiProperty({ example: 'week', description: '주 : week, 월 : month' })
  public period!: string;

  @ApiProperty({ type: [LeaderQuestResponseDto], description: '리더부여 퀘스트 결과 배열' })
  public leaderQuestResponse!: LeaderQuestResponseDto[];
}
