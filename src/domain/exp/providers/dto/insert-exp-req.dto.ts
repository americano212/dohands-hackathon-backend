import { ApiProperty } from '@nestjs/swagger';

export class InsertExpDto {
  @ApiProperty({ example: '2023010101', description: '사원번호' })
  public employeeId!: string;

  @ApiProperty({ example: '퀘스트명 예시', description: '퀘스트명' })
  public questName?: string;

  @ApiProperty({ example: 500, description: '획득한 경험치' })
  public exp!: number;

  @ApiProperty({
    example: 'J',
    description:
      'exp type ex)J(직무별), H1(상반기 인사평가), H2(하반기 인사평가), L(리더부여), C(전사)',
  })
  public expType!: string;

  @ApiProperty({ example: new Date(), description: '경험치 획득 날짜' })
  public expAt?: Date | null;

  @ApiProperty({ example: 1, description: '주차 (1~52)' })
  public week?: number | null;

  @ApiProperty({
    example: 'week',
    description: '직무별 퀘스트/리더부여 퀘스트에서 주기, 전사 프로젝트에서 프로젝트 기간',
  })
  public period?: string | null;

  @ApiProperty({ example: '프로젝트 내용 예시', description: '프로젝트 내용' })
  public content?: string | null;

  @ApiProperty({
    example: 'MAX',
    description: '달성 내용 ex)MAX, MEDIAN, S등급, A등급, B등급, C등급, D등급',
  })
  public achieveGrade?: string | null;
}
