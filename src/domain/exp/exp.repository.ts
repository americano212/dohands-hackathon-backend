import { Exp } from '#entities/exp.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdatePerformanceDto, CreatePerformanceDto } from './providers/performance/dto';
import { NullableType } from 'src/common/types';
@Injectable()
export class ExpsRepository {
  constructor(@InjectRepository(Exp) private expsRepository: Repository<Exp>) {}

  //인사평가 관련 메서드
  public async createPerformance(performanceData: CreatePerformanceDto): Promise<Exp> {
    return await this.expsRepository.save(await this.expsRepository.create(performanceData));
  }

  //사원번호와 기입한 연도, 상하반기(H1,H2)가 같은 경우에만 update
  public async updatePerformance(
    userId: number,
    year: number,
    expType: string,
    performanceData: UpdatePerformanceDto,
  ): Promise<boolean> {
    const result = await this.expsRepository
      .createQueryBuilder()
      .update(Exp)
      .set(performanceData)
      .where('userId = :userId', { userId })
      .andWhere('YEAR(expAt) = :year', { year })
      .andWhere('expType = :expType', { expType })
      .execute();
    return result.affected ? true : false;
  }

  //quarter ex) 1 or 2 -> H1은 작년 H2, H2는 올해 H1 구하도록 함
  //인사평가 변화량 구하는 API에서 사용
  public async getLastPerformance(userId: number, quarter: number): Promise<NullableType<Exp>> {
    const currentYear = new Date().getFullYear();
    if (quarter === 1) {
      //작년 H2
      return await this.expsRepository
        .createQueryBuilder('exp')
        .where('exp.userId = :userId', { userId })
        .andWhere('exp.expType = :expType', { expType: 'H2' })
        .andWhere('YEAR(exp.expAt) = :year', { year: currentYear - 1 })
        .getOne();
    } else {
      //올해 H1
      return await this.expsRepository
        .createQueryBuilder('exp')
        .where('exp.userId = :userId', { userId })
        .andWhere('exp.expType = :expType', { expType: 'H1' })
        .andWhere('YEAR(exp.expAt) = :year', { year: currentYear })
        .getOne();
    }
  }

  //올해 인사평가 결과 가져오기
  public async getPerformance(userId: number, quarter: number): Promise<NullableType<Exp>> {
    const currentYear = new Date().getFullYear();
    if (quarter === 1) {
      return await this.expsRepository
        .createQueryBuilder('exp')
        .where('exp.userId = :userId', { userId })
        .andWhere('exp.expType = :expType', { expType: 'H1' })
        .andWhere('YEAR(exp.expAt) = :year', { year: currentYear })
        .getOne();
    } else {
      return await this.expsRepository
        .createQueryBuilder('exp')
        .where('exp.userId = :userId', { userId })
        .andWhere('exp.expType = :expType', { expType: 'H2' })
        .andWhere('YEAR(exp.expAt) = :year', { year: currentYear })
        .getOne();
    }
  }
}
