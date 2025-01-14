import { Injectable } from '@nestjs/common';
import { ExpsRepository } from '../../exp.repository';
import { LeaderQuestFullResponseDto } from './dto/leader-quest-full-res.dto';
import { UsersRepository } from 'src/shared/user/user.repository';
import { GoogleSheetService, UtilService } from 'src/common';
@Injectable()
export class LeaderQuestService {
  constructor(
    private expsRepository: ExpsRepository,
    private usersRepository: UsersRepository,
    private gssService: GoogleSheetService,
    private utilService: UtilService,
  ) {}
  public async getLeaderQuest(userId: number): Promise<LeaderQuestFullResponseDto> {
    const weeks = this.utilService.getWeeksByYear(new Date().getFullYear());
    const range = 'K11:S13';
    const tabName = '리더부여 퀘스트';
    const values = await this.gssService.getValueFromSheet({ tabName, range });
    const questList = [];
    let totalExp = 0;
    const user = await this.usersRepository.findOne(userId);
    for (let idx = 0; idx < values.length; idx++) {
      const value = values[idx];
      if (value[0] === '' || value[1] === '' || value[4] === '' || value[5] === '') continue;
      const questName = value[0];
      const maxCondition = value.length >= 7 ? value[6] : '';
      const medianCondition = value.length >= 8 ? value[7] : '';
      const questGoal = value.length >= 9 ? value[8] : '';
      const [results, period] = await this.expsRepository.getLeaderQuest(userId, questName);

      if (period === 'week') {
        // 1~52주 기본 배열 생성
        const fullWeeks = Array.from({ length: weeks.length }, (_, index) => ({
          range: weeks[index].range,
          month: weeks[index].month,
          exp: 0,
          achieveGrade: 'MIN',
          index: index + 1, // 1~52
        }));

        // 결과를 주차(index) 기준으로 덮어쓰기
        results.forEach((result) => {
          totalExp += result.exp;
          const tmpIndex = (result.week || 1) - 1;
          fullWeeks[(result.week || 1) - 1] = {
            range: weeks[tmpIndex].range,
            month: weeks[tmpIndex].month,
            exp: result.exp,
            achieveGrade: result.achieveGrade || 'MIN',
            index: result.week || 1,
          };
        });

        questList.push({
          questName: questName,
          questGoal: questGoal,
          maxCondition: maxCondition.length > 5 ? '개선 리드' : maxCondition,
          medianCondition: medianCondition > 5 ? '개선 참여' : medianCondition,
          maxExp: value[4],
          medianExp: value[5],
          period: period,
          leaderQuestResponse: fullWeeks,
        });
      }
      if (period === 'month') {
        // 1~12월 기본 배열 생성
        const fullMonths = Array.from({ length: 12 }, (_, index) => ({
          exp: 0,
          achieveGrade: 'MIN',
          index: index + 1, // 1~12
          month: index + 1,
        }));

        // 결과를 월(index) 기준으로 덮어쓰기
        results.forEach((result) => {
          const monthIndex = result.expAt?.getMonth();
          if (monthIndex !== undefined) {
            totalExp += result.exp;
            fullMonths[monthIndex] = {
              exp: result.exp,
              achieveGrade: result.achieveGrade || 'MIN',
              index: monthIndex + 1,
              month: fullMonths[monthIndex].month,
            };
          }
        });

        questList.push({
          questName: questName,
          questGoal: questGoal,
          maxCondition: maxCondition.length > 5 ? '개선 리드' : maxCondition,
          medianCondition: medianCondition.length > 5 ? '개선 참여' : medianCondition,
          maxExp: value[4],
          medianExp: value[5],
          period: period,
          leaderQuestResponse: fullMonths,
        });
      }
    }

    return {
      department: user?.department || '',
      jobGroup: user?.jobGroup || 1,
      questCount: questList.length,
      totalExp: totalExp,
      questInfo: questList,
    };
  }
}
