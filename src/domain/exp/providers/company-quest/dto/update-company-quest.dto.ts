import { Exp } from '#entities/exp.entity';
import { PickType } from '@nestjs/swagger';

export class UpdateCompanyQuestDto extends PickType(Exp, [
  'user',
  'expAt',
  'exp',
  'period',
  'questName',
  'content',
] as const) {}
