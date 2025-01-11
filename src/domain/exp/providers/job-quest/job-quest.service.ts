import { Injectable } from '@nestjs/common';
import { ExpsRepository } from '../../exp.repository';
import { JobQuestResponseDto } from './dto';
@Injectable()
export class JobQuestService {
  constructor(private expsRepository: ExpsRepository) {}
  public async getJobQuest(userId: number): Promise<JobQuestResponseDto[]> {
    const [results, period] = await this.expsRepository.getJobQuest(userId);
    if (period === 'week') {
      // 1~52주 기본 배열 생성
      const fullWeeks = Array.from({ length: 52 }, (_, index) => ({
        period: 'week',
        exp: 0,
        achieveGrade: 'MIN',
        index: index + 1, // 1~52
      }));

      // 결과를 주차(index) 기준으로 덮어쓰기
      results.forEach((result) => {
        fullWeeks[(result.week || 1) - 1] = {
          period: result.period || 'week',
          exp: result.exp,
          achieveGrade: result.achieveGrade || 'MIN',
          index: result.week || 1,
        };
      });

      return fullWeeks;
    }
    if (period === 'month') {
      // 1~12월 기본 배열 생성
      const fullMonths = Array.from({ length: 12 }, (_, index) => ({
        period: 'month',
        exp: 0,
        achieveGrade: 'MIN',
        index: index + 1, // 1~12
      }));

      // 결과를 월(index) 기준으로 덮어쓰기
      results.forEach((result) => {
        const monthIndex = result.expAt?.getMonth();
        if (monthIndex !== undefined) {
          fullMonths[monthIndex] = {
            period: result.period || 'month',
            exp: result.exp,
            achieveGrade: result.achieveGrade || 'MIN',
            index: monthIndex + 1,
          };
        }
      });

      return fullMonths;
    }

    throw new Error(`Unsupported period type: ${period}`);
  }
}
