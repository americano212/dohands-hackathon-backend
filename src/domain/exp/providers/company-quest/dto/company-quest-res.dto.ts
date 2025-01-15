import { Exp } from '#entities/exp.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';

//exp 전체 조회할 때 사용
export class CompanyQuestResponseDto extends PickType(Exp, [
  'expAt',
  'period',
  'questName',
  'content',
  'exp',
] as const) {
  @ApiProperty({ example: '01.05-01.08', description: '전사 프로젝트 기간' })
  public override period?: string | null;
}
