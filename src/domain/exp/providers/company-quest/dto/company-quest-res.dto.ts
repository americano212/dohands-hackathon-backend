import { Exp } from '#entities/exp.entity';
import { PickType } from '@nestjs/swagger';

//exp 전체 조회할 때 사용
export class CompanyQuestResponseDto extends PickType(Exp, [
  'expAt',
  'period',
  'questName',
  'content',
  'exp',
] as const) {}
