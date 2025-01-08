import { Injectable } from '@nestjs/common';
//import { UpdatePerformanceDto } from './dto';
import { PerformanceResponseDto } from './dto';
import { ExpsRepository } from '../../exp.repository';
import { NullableType } from 'src/common/types';
import { Exp } from '#entities/exp.entity';

@Injectable()
export class PerformanceService {
  constructor(private expsRepository: ExpsRepository) {}

  public async getPerformance(userId: number): Promise<NullableType<PerformanceResponseDto>[]> {
    const quarters = [1, 2]; // H1, H2에 해당하는 쿼터
    const results = await Promise.all(
      quarters.map(async (quarter) => {
        const [current, previous] = await Promise.all([
          this.expsRepository.getPerformance(userId, quarter),
          this.expsRepository.getLastPerformance(userId, quarter),
        ]);
        return this.processPerformance(current, previous);
      }),
    );

    return results;
  }

  //인사평가 변화량 계산
  private processPerformance(
    current: NullableType<Exp>,
    previous: NullableType<Exp>,
  ): NullableType<PerformanceResponseDto> {
    const grades = ['D등급', 'C등급', 'B등급', 'A등급', 'S등급'];

    const currentResult = current?.result?.charAt(0) ?? '';
    const previousResult = previous?.result?.charAt(0) ?? '';

    const currentIdx = grades.indexOf(currentResult);
    const previousIdx = grades.indexOf(previousResult);

    return {
      expAt: current?.expAt || null,
      exp: current?.exp || 0,
      result: currentResult || null,
      diff: currentIdx !== -1 && previousIdx !== -1 ? currentIdx - previousIdx : null,
    };
  }
}
