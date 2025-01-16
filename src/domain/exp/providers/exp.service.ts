import { Injectable, NotFoundException } from '@nestjs/common';
import { ExpsRepository } from '../exp.repository';
import { GoogleSheetService } from 'src/common';
import { ExpResponseDto, InsertExpDto } from './dto';
import { ExpStatusResponseDto } from './dto/exp-status-res.dto';
import { UsersRepository } from 'src/shared/user/user.repository';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PerformanceFromGSSDto } from './performance/dto';
import { CompanyQuestFromGSSDto } from './company-quest/dto/company-quest-from-gss.dto';
import { JobQuestFromGSSDto } from './job-quest/dto';
import { LeaderQuestFromGSSDto } from './leader-quest/dto';
import { Transactional } from 'typeorm-transactional';
import { BadgeService } from 'src/domain/badge/badge.service';
import { BadgeCode } from 'src/domain/badge/badge.enum';
import { NoticeService } from 'src/shared/notice/providers';
import { SendNoticeDto } from 'src/shared/notice/providers/dto';

@Injectable()
export class ExpService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly expsRepository: ExpsRepository,
    private readonly gssService: GoogleSheetService,
    private readonly badgeService: BadgeService,
    private readonly notice: NoticeService,
  ) {}

  // limit : 제한
  public async findExps(userId: number, limit?: number): Promise<ExpResponseDto[]> {
    const exps = await this.expsRepository.findExps(userId, limit);

    return exps.map((exp) => ({
      expType: exp.expType,
      expAt: exp.expAt,
      exp: exp.exp,
      questName: exp.questName,
    }));
  }

  public async getExpStatus(userId: number): Promise<ExpStatusResponseDto> {
    const user = await this.usersRepository.findOne(userId);
    if (!user) throw new NotFoundException(`User ID ${userId} NOT Found`);
    return await this.expsRepository.getExpStatus(userId, user.jobFamily);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  public async getExpsFromGSS(): Promise<boolean> {
    //TODO: 하드 코딩된부분 고치기!
    const h1Range = 'B10:E100';
    const h2Range = 'H10:K100';
    const jobRange = 'B16:C100';
    const jobInfo = 'B13:J13';
    const leaderRange = 'B10:H100';
    const companyRange = 'B8:I100';
    // 상반기 인사평가
    await this.processPerformanceGSS('인사평가', h1Range, 1);
    // 하반기 인사평가
    await this.processPerformanceGSS('인사평가', h2Range, 2);
    // 직무별 퀘스트
    await this.processJobQuestGSS('직무별 퀘스트', jobRange, jobInfo);
    // 리더부여 퀘스트
    await this.processLeaderQuestGSS('리더부여 퀘스트', leaderRange);
    // 전사 프로젝트
    await this.processCompanyQuestGSS('전사 프로젝트', companyRange);

    return true;
  }

  public async processPerformanceGSS(
    tabName: string,
    range: string,
    quarter: number,
  ): Promise<boolean> {
    const values = await this.gssService.getValueFromSheet({ tabName, range });
    for (let idx = 0; idx < values.length; idx++) {
      const value = values[idx];
      if (
        value.length < 4 ||
        value[0] === '' ||
        value[1] === '' ||
        value[2] === '' ||
        value[3] === ''
      )
        continue;
      const user = await this.usersRepository.findOneByEmployeeId(value[0]);
      if (!user) {
        throw new NotFoundException(`Not Found user_id ${value[0]}`);
      }
      const exp: PerformanceFromGSSDto = {
        googleSheetId: `${idx + 10}`,
        user: user,
        achieveGrade: value[2],
        exp: Number(value[3]),
        expAt: new Date(),
        expType: `H${quarter}`,
      };

      const isExist = await this.expsRepository.isExistGoogleSheetId(exp);

      if (isExist) {
        const result = await this.expsRepository.updatePerformance(exp.googleSheetId, exp.expType, {
          user: exp.user,
          expAt: exp.expAt,
          exp: exp.exp,
          achieveGrade: exp.achieveGrade,
        });
        if (result) await this.evaluateGivingBadge(user.userId, exp.expType);
      } else if (await this.expsRepository.create(exp)) {
        await this.sendNotice(user.userId);
        await this.evaluateGivingBadge(user.userId, exp.expType);
      }
    }
    return true;
  }

  public async processJobQuestGSS(
    tabName: string,
    range: string,
    jobInfo: string,
  ): Promise<boolean> {
    const values = await this.gssService.getValueFromSheet({ tabName, range });
    const infos = await this.gssService.getValueFromSheet({ tabName, range: jobInfo });
    const users = await this.usersRepository.findAllByJobGroup(infos[0][4], Number(infos[0][5]));
    if (!users) return true;

    for (let idx = 0; idx < values.length; idx++) {
      const value = values[idx];
      if (value.length < 2 || value[1] === '0') continue;
      for (let i = 0; i < users.length; i++) {
        if (infos[0].length < 7) continue;
        const user = users[i];
        const expAt = new Date();
        let week = null;
        if (infos[0][6] === '월' && value[0] !== '') {
          expAt.setMonth(Number(value[0]));
        }
        if (infos[0][6] === '주' && value[0] !== '') {
          week = Number(value[0]);
        }
        const exp: JobQuestFromGSSDto = {
          googleSheetId: `${idx + 16}`,
          user: user,
          exp: Number(value[1]),
          expAt: expAt,
          period: infos[0][6] === '월' ? 'month' : 'week',
          achieveGrade: value[1] === infos[0][0] ? 'MAX' : 'MEDIAN',
          expType: 'J',
          week: week,
        };

        const isExist = await this.expsRepository.isExistGoogleSheetId(exp);

        if (isExist) {
          const result = await this.expsRepository.updateJobQuest(exp.googleSheetId, exp.expType, {
            expAt: exp.expAt,
            exp: exp.exp,
            period: exp.period,
            week: exp.week,
            achieveGrade: exp.achieveGrade,
          });
          if (result) await this.evaluateGivingBadge(user.userId, exp.expType);
        } else if (await this.expsRepository.create(exp)) {
          await this.sendNotice(user.userId);
          await this.evaluateGivingBadge(user.userId, exp.expType);
        }
      }
    }
    return true;
  }

  public async processLeaderQuestGSS(tabName: string, range: string): Promise<boolean> {
    const values = await this.gssService.getValueFromSheet({ tabName, range });
    for (let idx = 0; idx < values.length; idx++) {
      const value = values[idx];
      if (
        value.length < 7 ||
        (value[0] === '' && value[1] === '') ||
        value[2] === '' ||
        value[4] === '' ||
        value[5] === '' ||
        value[6] === ''
      )
        continue;
      const user = await this.usersRepository.findOneByEmployeeId(value[2]);
      if (!user) {
        throw new NotFoundException(`Not Found user_id ${value[2]}`);
      }
      const expAt = new Date();
      let week = null;
      let period = 'month';
      if (value[0] !== '') {
        week = Number(value[0]);
        period = 'week';
      }
      if (value[1] !== '') expAt.setMonth(Number(value[1]) - 1);
      const exp: LeaderQuestFromGSSDto = {
        googleSheetId: `${idx + 10}`,
        user: user,
        exp: Number(value[6]),
        expAt: expAt,
        week: week,
        questName: value[4],
        achieveGrade: value[5] === 'Max' ? 'MAX' : 'MEDIAN',
        period: period,
        expType: 'L',
      };

      const isExist = await this.expsRepository.isExistGoogleSheetId(exp);

      if (isExist) {
        const result = await this.expsRepository.updateLeaderQuest(exp.googleSheetId, exp.expType, {
          user: exp.user,
          week: exp.week,
          expAt: exp.expAt,
          exp: exp.exp,
          period: exp.period,
          questName: exp.questName,
          achieveGrade: exp.achieveGrade,
        });
        if (result) await this.evaluateGivingBadge(user.userId, exp.expType);
      } else if (await this.expsRepository.create(exp)) {
        await this.sendNotice(user.userId);
        await this.evaluateGivingBadge(user.userId, exp.expType);
      }
    }
    return true;
  }

  public async processCompanyQuestGSS(tabName: string, range: string): Promise<boolean> {
    const values = await this.gssService.getValueFromSheet({ tabName, range });
    for (let idx = 0; idx < values.length; idx++) {
      const value = values[idx];
      if (
        value.length < 8 ||
        value[2] === '' ||
        value[4] === '' ||
        value[5] === '' ||
        value[7] === ''
      )
        continue;

      const user = await this.usersRepository.findOneByEmployeeId(value[2]);
      if (!user) {
        throw new NotFoundException(`Not Found user_id ${value[2]}`);
      }
      const expAt = new Date();
      if (value[0] !== '') expAt.setMonth(Number(value[0]) - 1);
      if (value[1] !== '') expAt.setDate(Number(value[1]));
      const exp: CompanyQuestFromGSSDto = {
        googleSheetId: `${idx + 8}`,
        user: user,
        exp: Number(value[7]),
        expAt: expAt,
        questName: value[4],
        content: value[6],
        period: value[5],
        expType: 'C',
      };

      const isExist = await this.expsRepository.isExistGoogleSheetId(exp);

      if (isExist) {
        const result = await this.expsRepository.updateCompanyQuest(
          exp.googleSheetId,
          exp.expType,
          {
            user: exp.user,
            expAt: exp.expAt,
            exp: exp.exp,
            period: exp.period,
            questName: exp.questName,
            content: exp.content,
          },
        );
        if (result) await this.evaluateGivingBadge(user.userId, exp.expType);
      } else if (await this.expsRepository.create(exp)) {
        await this.sendNotice(user.userId);
        await this.evaluateGivingBadge(user.userId, exp.expType);
      }
    }
    return true;
  }

  public async postExp(body: InsertExpDto): Promise<boolean> {
    const user = await this.usersRepository.findOneByEmployeeId(body.employeeId);
    if (!user) {
      throw new NotFoundException(`Not Found user_id ${body.employeeId}`);
    }
    const exp = await this.expsRepository.postExp(user, body);
    if (!exp) {
      return false;
    }
    await this.sendNotice(user.userId);
    await this.evaluateGivingBadge(user.userId, exp.expType);
    return true;
  }

  private async sendNotice(userId: number): Promise<boolean> {
    const sendNoticeData: SendNoticeDto = {
      userIdList: [userId],
      title: '축하합니다! 새로운 두둥 경험치를 받았어요!',
      body: '새로운 두둥 경험치가 추가되었습니다. 다음 미션도 도전하세요!',
    };
    return await this.notice.sendNotice(sendNoticeData);
  }

  @Transactional()
  public async evaluateGivingBadge(userId: number, expType: string): Promise<void> {
    expType = expType.charAt(0);
    switch (expType) {
      case 'H': // [인사평가]
        let isSGradeInH1H2 = false; // 인사평가에서 작년 상/하반기 둘다 S 받은 경우
        const h1 = await this.expsRepository.getPerformance(userId, 1, true);
        const h2 = await this.expsRepository.getPerformance(userId, 2, true);
        if (h1?.achieveGrade === 'S등급' && h2?.achieveGrade === 'S등급') isSGradeInH1H2 = true;
        if (isSGradeInH1H2)
          await this.badgeService.giveBadgeToUser(userId, BadgeCode.S_GRADE_H1_H2);
        return;
      case 'J': // [직무별]
        let isExpOver1700 = false; // 직무 미션에서 1700 경험치 이상 획득
        let exp = 0;
        const jobQuestResults = await this.expsRepository.getJobQuest(userId);
        for (const result of jobQuestResults[0]) {
          exp += result.exp;
        }
        if (exp >= 1700) {
          isExpOver1700 = true;
        }

        if (isExpOver1700)
          await this.badgeService.giveBadgeToUser(userId, BadgeCode.JOB_EXP_OVER_1700);
        return;
      case 'C': // [전사]
        let isCompanyProjectOver5 = false; // 전사 프로젝트 5회 이상 참여시
        const companyQuestResults = await this.expsRepository.getCompanyQuest(userId);
        if (companyQuestResults.length >= 5) isCompanyProjectOver5 = true;
        if (isCompanyProjectOver5)
          await this.badgeService.giveBadgeToUser(userId, BadgeCode.COMPANY_PROJECT_OVER_5);
        return;
      case 'L': // [리더부여]
        let isMonthSpecialJobOver6 = false; //  월 특근 미션 경험치 6회 이상 획득시
        const leaderQuestResults = await this.expsRepository.getLeaderQuest(userId, '월특근');
        if (leaderQuestResults[0].length >= 6) isMonthSpecialJobOver6 = true;
        if (isMonthSpecialJobOver6)
          await this.badgeService.giveBadgeToUser(userId, BadgeCode.MONTH_SPECIAL_JOB_OVER_6);
        return;
      default:
        return;
    }
  }
}
