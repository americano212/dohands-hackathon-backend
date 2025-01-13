import { ApiProperty } from '@nestjs/swagger';

//exp 현황 조회할 때 사용 (통계)
export class ExpStatusResponseDto {
  @ApiProperty({ example: 'F', description: '직군' })
  public jobFamily!: string;

  @ApiProperty({ example: 'F1-I', description: '현재 레벨' })
  public currentLevel!: string;

  @ApiProperty({ example: 'F1-II', description: '내년 예상 레벨' })
  public expectedLevel!: string;

  @ApiProperty({ example: 400, description: '올해 획득한 경험치' })
  public currentYearExp!: number;

  @ApiProperty({ example: 14000, description: '획득한 총 경험치' })
  public totalExp!: number;

  @ApiProperty({ example: 13600, description: '작년까지 획득한 경험치' })
  public lastYearExp!: number;

  @ApiProperty({ example: 7, description: '총 경험치 얻은 횟수' })
  public expCount!: number;

  @ApiProperty({ example: 13000, description: '다음 레벨까지 남은 경험치' })
  public expToNextLevel!: number;

  @ApiProperty({
    example: [
      {
        year: 2023,
        expType: 'J',
        questName: '생산성 향상',
        exp: 1500,
        expAt: '2025-01-13T10:39:39.544Z',
      },
      {
        year: 2024,
        expType: 'L',
        questName: '월특근',
        exp: 1500,
        expAt: '2025-01-13T10:39:39.544Z',
      },
    ],
    description: '과거 획득한 연도별 경험치',
  })
  public expList!: {
    year: number;
    expType: string;
    questName: string;
    exp: number;
    expAt: Date;
  }[];
}
