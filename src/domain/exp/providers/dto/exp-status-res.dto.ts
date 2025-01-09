import { ApiProperty } from '@nestjs/swagger';

//exp 현황 조회할 때 사용 (통계)
export class ExpStatusResponseDto {
  @ApiProperty({ example: 'F1-I', description: '현재 레벨' })
  public currentLevel!: string;

  @ApiProperty({ example: 'F1-II', description: '내년 예상 레벨' })
  public expectedLevel!: string;

  @ApiProperty({ example: 400, description: '올해 획득한 경험치' })
  public currentYearExp!: number;

  @ApiProperty({ example: 14000, description: '과거 획득한 총 경험치' })
  public lastYearExp!: number;

  @ApiProperty({
    example: [
      { year: 2023, exp: 1500 },
      { year: 2024, exp: 12500 },
    ],
    description: '과거 획득한 연도별 경험치',
  })
  public lastYearExpList!: { year: number; exp: number }[];

  @ApiProperty({ example: 13000, description: '다음 레벨까지 남은 경험치' })
  public expToNextLevel!: number;
}
