import { Injectable } from '@nestjs/common';
import { ExpsRepository } from '../../exp.repository';
import { JobQuestFullResponseDto } from './dto/job-quest-full-res.dto';
import { UsersRepository } from 'src/shared/user/user.repository';
@Injectable()
export class JobQuestService {
  constructor(
    private expsRepository: ExpsRepository,
    private usersRepository: UsersRepository,
  ) {}
  public async getJobQuest(userId: number): Promise<JobQuestFullResponseDto> {
    const [results, period] = await this.expsRepository.getJobQuest(userId);
    const user = await this.usersRepository.findOne(userId);
    if (period === 'week') {
      // 1~52주 기본 배열 생성
      const fullWeeks = Array.from({ length: 52 }, (_, index) => ({
        exp: 0,
        achieveGrade: 'MIN',
        index: index + 1, // 1~52
      }));
      let totalExp = 0;

      // 결과를 주차(index) 기준으로 덮어쓰기
      results.forEach((result) => {
        totalExp += result.exp;
        fullWeeks[(result.week || 1) - 1] = {
          exp: result.exp,
          achieveGrade: result.achieveGrade || 'MIN',
          index: result.week || 1,
        };
      });

      return {
        department: user?.department || '',
        jobGroup: user?.jobGroup || 1,
        questName: '생산성 향상',
        questGoal: '5번 연속 두둥 경험치 획득',
        maxCondition: '5.1 이상',
        medianCondition: '4.3 이상',
        maxExp: 80,
        medianExp: 40,
        totalExp: totalExp,
        period: period,
        jobQuestResponse: fullWeeks,
      };
    }
    if (period === 'month') {
      // 1~12월 기본 배열 생성
      const fullMonths = Array.from({ length: 12 }, (_, index) => ({
        exp: 0,
        achieveGrade: 'MIN',
        index: index + 1, // 1~12
      }));
      let totalExp = 0;

      // 결과를 월(index) 기준으로 덮어쓰기
      results.forEach((result) => {
        const monthIndex = result.expAt?.getMonth();
        if (monthIndex !== undefined) {
          totalExp += result.exp;
          fullMonths[monthIndex] = {
            exp: result.exp,
            achieveGrade: result.achieveGrade || 'MIN',
            index: monthIndex + 1,
          };
        }
      });

      return {
        department: user?.department || '',
        jobGroup: user?.jobGroup || 1,
        questName: '생산성 향상',
        questGoal: '5번 연속 두둥 경험치 획득',
        maxCondition: '5.1 이상',
        medianCondition: '4.3 이상',
        maxExp: 80,
        medianExp: 40,
        totalExp: totalExp,
        period: period,
        jobQuestResponse: fullMonths,
      };
    }

    throw new Error(`Unsupported period type: ${period}`);
  }
}
