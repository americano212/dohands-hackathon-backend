import { Exp } from '#entities/exp.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';

//exp 전체 조회할 때 사용
export class JobQuestResponseDto extends PickType(Exp, ['exp', 'achieveGrade'] as const) {
  @ApiProperty({
    example: 1,
    description: 'period가 week인 경우에는 주차, month인 경우에는 월',
  })
  public index!: number;
}
