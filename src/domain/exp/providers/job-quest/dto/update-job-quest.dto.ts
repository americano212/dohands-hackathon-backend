import { Exp } from '#entities/exp.entity';
import { PickType } from '@nestjs/swagger';

export class UpdateJobQuestDto extends PickType(Exp, [
  'exp',
  'period',
  'expAt',
  'week',
  'achieveGrade',
] as const) {}
