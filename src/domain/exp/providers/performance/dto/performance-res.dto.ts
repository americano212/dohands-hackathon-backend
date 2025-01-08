import { Exp } from '#entities/exp.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';

//exp 전체 조회할 때 사용
//diff는 인사평가 결과 변화량 (존재하지 않으면 null)
export class PerformanceResponseDto extends PickType(Exp, ['expAt', 'exp', 'result'] as const) {
  @ApiProperty({ example: 2 })
  public diff?: number | null;
}
