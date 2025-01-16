import { Exp } from '#entities/exp.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdatePerformanceDto } from './providers/performance/dto';
import { NullableType } from 'src/common/types';
import { ExpStatusResponseDto } from './providers/dto/exp-status-res.dto';
import { CreateExpDto, InsertExpDto } from './providers/dto';
import { UpdateCompanyQuestDto } from './providers/company-quest/dto';
import { UpdateJobQuestDto } from './providers/job-quest/dto';
import { UpdateLeaderQuestDto } from './providers/leader-quest/dto';
import { User } from '#entities/user.entity';

// 직군 키 타입
type JobFamily = 'F' | 'B' | 'G' | 'T';

// 레벨 테이블
const levelTable: Record<JobFamily, { level: string; exp: number }[]> = {
  F: [
    { level: 'F1-I', exp: 0 },
    { level: 'F1-II', exp: 13500 },
    { level: 'F2-I', exp: 27000 },
    { level: 'F2-II', exp: 39000 },
    { level: 'F2-III', exp: 51000 },
    { level: 'F3-I', exp: 63000 },
    { level: 'F3-II', exp: 78000 },
    { level: 'F3-III', exp: 93000 },
    { level: 'F4-I', exp: 108000 },
    { level: 'F4-II', exp: 126000 },
    { level: 'F4-III', exp: 144000 },
    { level: 'F5', exp: 162000 },
  ],
  B: [
    { level: 'B1', exp: 0 },
    { level: 'B2', exp: 24000 },
    { level: 'B3', exp: 52000 },
    { level: 'B4', exp: 78000 },
    { level: 'B5', exp: 117000 },
    { level: 'B6', exp: 169000 },
  ],
  G: [
    { level: 'G1', exp: 0 },
    { level: 'G2', exp: 24000 },
    { level: 'G3', exp: 52000 },
    { level: 'G4', exp: 78000 },
    { level: 'G5', exp: 117000 },
    { level: 'G6', exp: 169000 },
  ],
  T: [
    { level: 'T1', exp: 0 },
    { level: 'T2', exp: 24000 },
    { level: 'T3', exp: 52000 },
    { level: 'T4', exp: 78000 },
    { level: 'T5', exp: 117000 },
    { level: 'T6', exp: 169000 },
  ],
};

@Injectable()
export class ExpsRepository {
  constructor(@InjectRepository(Exp) private expsRepository: Repository<Exp>) {}

  public async findExps(userId: number, limit?: number): Promise<Exp[]> {
    return await this.expsRepository.find({
      where: { user: { userId } },
      order: { expAt: 'DESC' },
      take: limit, // limit이 설정된 경우 해당 개수만큼 가져오기
    });
  }

  public async getExpStatus(user: number, jobFamily: string | null): Promise<ExpStatusResponseDto> {
    const currentYear = new Date().getFullYear();
    // 올해 획득한 경험치 합계 가져오기
    const currentYearExp = await this.expsRepository
      .createQueryBuilder('exp')
      .select('SUM(exp.exp)', 'totalExp')
      .where('exp.user = :userId', { userId: user })
      .andWhere('YEAR(exp.expAt) = :year', { year: currentYear })
      .getRawOne()
      .then((result) => Number(result.totalExp) || 0); // 합계가 없을 경우 0으로 처리

    const lastYearExp = await this.expsRepository
      .createQueryBuilder('exp')
      .select('SUM(exp.exp)', 'totalExp')
      .where('exp.user = :userId', { userId: user })
      .andWhere('YEAR(exp.expAt) < :year', { year: currentYear })
      .getRawOne()
      .then((result) => Number(result.totalExp) || 0); // 합계가 없을 경우 0으로 처리

    // 연도별 경험치 가져오기
    const expList = await this.expsRepository
      .createQueryBuilder('exp')
      .where('exp.user = :userId', { userId: user }) // 유저 필터링
      .orderBy('exp.expAt', 'DESC') // 날짜 내림차순 정렬
      .getMany();

    // 결과 변환 (year와 exp를 객체 형태로 변환)
    const formattedExpList = expList.map((row) => ({
      year: row.expAt?.getFullYear() || currentYear,
      expType: row.expType,
      questName:
        row.questName ||
        (row.expType.charAt(0) === 'H'
          ? '인사평가'
          : row.expType.charAt(0) === 'J'
            ? '생산성 향상'
            : ''),
      exp: row.exp,
      expAt: row.expAt || new Date(),
    }));

    const totalExp = formattedExpList.reduce((sum, item) => sum + item.exp, 0);
    // const lastYearExp = totalExp - currentYearExp;

    if (!jobFamily || !['F', 'B', 'G', 'T'].includes(jobFamily)) {
      jobFamily = 'F';
    }

    // 직군에 맞는 레벨 테이블 가져오기
    const levels = levelTable[jobFamily as JobFamily];

    if (!levels) {
      throw new Error('Invalid jobFamily provided.');
    }

    // 현재 레벨 계산
    const currentLevelIndex = levels.findIndex(
      (level, index) =>
        lastYearExp >= level.exp &&
        (index === levels.length - 1 || lastYearExp < levels[index + 1].exp),
    );
    const currentLevel = currentLevelIndex >= 0 ? levels[currentLevelIndex].level : levels[0].level;
    const expToCurrentNextLevel =
      currentLevelIndex + 1 < levels.length ? levels[currentLevelIndex + 1].exp - lastYearExp : 0;

    // 예상 레벨 계산
    const expectedLevelIndex = levels.findIndex(
      (level, index) =>
        totalExp >= level.exp && (index === levels.length - 1 || totalExp < levels[index + 1].exp), // 구간 확인
    );

    const expectedLevel =
      expectedLevelIndex >= 0 ? levels[expectedLevelIndex].level : levels[0].level;

    // expToNextLevel 계산
    const expToNextLevel =
      expectedLevelIndex + 1 < levels.length ? levels[expectedLevelIndex + 1].exp - totalExp : 0;

    return {
      jobFamily: jobFamily,
      currentLevel: currentLevel,
      currentNextLevel:
        currentLevelIndex + 1 < levels.length ? levels[currentLevelIndex + 1].level : '-',
      expectedLevel: expectedLevel,
      currentYearExp: currentYearExp,
      lastYearExp: lastYearExp,
      totalExp: totalExp,
      expToExpectedLevel: levels[expectedLevelIndex].exp,
      expToNextLevel: expToNextLevel,
      expToCurrentLevel: levels[currentLevelIndex].exp,
      expToCurrentNextLevel: expToCurrentNextLevel,
      expCount: expList.length,
      expList: formattedExpList,
    };
  }

  //추가 메서드
  public async create(expData: CreateExpDto): Promise<Exp> {
    return await this.expsRepository.save(await this.expsRepository.create(expData));
  }

  public async updatePerformance(
    googleSheetId: string,
    expType: string,
    performanceData: UpdatePerformanceDto,
  ): Promise<boolean> {
    const result = await this.expsRepository.update(
      { googleSheetId: googleSheetId, expType: expType },
      performanceData,
    );
    return result.affected ? true : false;
  }

  public async updateCompanyQuest(
    googleSheetId: string,
    expType: string,
    companyQuestData: UpdateCompanyQuestDto,
  ): Promise<boolean> {
    const result = await this.expsRepository.update(
      { googleSheetId: googleSheetId, expType: expType },
      companyQuestData,
    );
    return result.affected ? true : false;
  }

  public async updateJobQuest(
    googleSheetId: string,
    expType: string,
    jobQuestData: UpdateJobQuestDto,
  ): Promise<boolean> {
    const result = await this.expsRepository.update(
      { googleSheetId: googleSheetId, expType: expType },
      jobQuestData,
    );
    return result.affected ? true : false;
  }

  public async updateLeaderQuest(
    googleSheetId: string,
    expType: string,
    leaderQuestData: UpdateLeaderQuestDto,
  ): Promise<boolean> {
    const result = await this.expsRepository.update(
      { googleSheetId: googleSheetId, expType: expType },
      leaderQuestData,
    );
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
        .where('exp.user = :userId', { userId: userId })
        .andWhere('exp.expType = :expType', { expType: 'H2' })
        .andWhere('YEAR(exp.expAt) = :year', { year: currentYear - 1 })
        .getOne();
    } else {
      //올해 H1
      return await this.expsRepository
        .createQueryBuilder('exp')
        .where('exp.user = :userId', { userId: userId })
        .andWhere('exp.expType = :expType', { expType: 'H1' })
        .andWhere('YEAR(exp.expAt) = :year', { year: currentYear })
        .getOne();
    }
  }

  //올해 or 작년 인사평가 결과 가져오기
  public async getPerformance(
    userId: number,
    quarter: number,
    isLastYear: boolean = false,
  ): Promise<NullableType<Exp>> {
    const currentYear = new Date().getFullYear();
    const year = isLastYear ? currentYear - 1 : currentYear;
    return await this.expsRepository
      .createQueryBuilder('exp')
      .where('exp.user = :userId', { userId: userId })
      .andWhere('exp.expType = :expType', { expType: `H${quarter}` })
      .andWhere('YEAR(exp.expAt) = :year', { year: year })
      .orderBy('exp.expAt', 'DESC')
      .getOne();
  }

  //올해 전사 프로젝트 결과 가져오기
  public async getCompanyQuest(userId: number): Promise<Exp[]> {
    const currentYear = new Date().getFullYear();
    return await this.expsRepository
      .createQueryBuilder('exp')
      .where('exp.user = :userId', { userId: userId })
      .andWhere('exp.expType = :expType', { expType: 'C' })
      .andWhere('YEAR(exp.expAt) = :year', { year: currentYear })
      .orderBy('exp.expAt', 'DESC')
      .getMany();
  }

  public async getJobQuest(userId: number): Promise<[Exp[], string]> {
    const currentYear = new Date().getFullYear();
    const weeklyResult = await this.expsRepository
      .createQueryBuilder('exp')
      .where('exp.user = :userId', { userId: userId })
      .andWhere('exp.expType = :expType', { expType: 'J' })
      .andWhere('YEAR(exp.expAt) = :year', { year: currentYear })
      .andWhere('exp.period = :period', { period: 'week' })
      .orderBy('exp.week', 'ASC')
      .getMany();

    if (weeklyResult.length > 0) return [weeklyResult, 'week'];
    const monthlyResult = await this.expsRepository
      .createQueryBuilder('exp')
      .where('exp.user = :userId', { userId: userId })
      .andWhere('exp.expType = :expType', { expType: 'J' })
      .andWhere('YEAR(exp.expAt) = :year', { year: currentYear })
      .andWhere('exp.period = :period', { period: 'month' })
      .orderBy('MONTH(exp.expAt)', 'ASC') // week 기준 오름차순 정렬
      .getMany();
    return [monthlyResult, 'month'];
  }

  /*
  public async getLeaderQuestNameList(userId: number): Promise<string[]> {
    const rawResults = await this.expsRepository
      .createQueryBuilder('exp')
      .select('exp.questName', 'questName')
      .where('exp.user = :userId', { userId: userId })
      .andWhere('exp.exp_type = :expType', { expType: 'L' })
      .groupBy('exp.questName')
      .getRawMany();

    return rawResults.map((result) => result.questName);
  }
  */

  public async getLeaderQuest(userId: number, questName: string): Promise<[Exp[], string]> {
    const currentYear = new Date().getFullYear();
    const weeklyResult = await this.expsRepository
      .createQueryBuilder('exp')
      .where('exp.user = :userId', { userId: userId })
      .andWhere('exp.expType = :expType', { expType: 'L' })
      .andWhere('exp.questName = :questName', { questName: questName })
      .andWhere('YEAR(exp.expAt) = :year', { year: currentYear })
      .andWhere('exp.period = :period', { period: 'week' })
      .orderBy('exp.week', 'ASC')
      .getMany();

    if (weeklyResult.length > 0) return [weeklyResult, 'week'];
    const monthlyResult = await this.expsRepository
      .createQueryBuilder('exp')
      .where('exp.user = :userId', { userId: userId })
      .andWhere('exp.expType = :expType', { expType: 'L' })
      .andWhere('exp.questName = :questName', { questName: questName })
      .andWhere('YEAR(exp.expAt) = :year', { year: currentYear })
      .andWhere('exp.period = :period', { period: 'month' })
      .orderBy('MONTH(exp.expAt)', 'ASC') // week 기준 오름차순 정렬
      .getMany();
    return [monthlyResult, 'month'];
  }

  public async isExistGoogleSheetId(createExpDto: CreateExpDto): Promise<boolean> {
    if (createExpDto.expType[0] !== 'J') {
      return await this.expsRepository
        .createQueryBuilder('exp')
        .where('exp.expType = :expType', { expType: createExpDto.expType })
        .andWhere('exp.googleSheetId = :googleSheetId', {
          googleSheetId: createExpDto.googleSheetId,
        })
        .getExists();
    }

    // 직무별 퀘스트 exist 판단
    return await this.expsRepository
      .createQueryBuilder('exp')
      .where('exp.user = :userId', { userId: createExpDto.user.userId })
      .andWhere('exp.expType = :expType', { expType: createExpDto.expType })
      .andWhere('exp.googleSheetId = :googleSheetId', {
        googleSheetId: createExpDto.googleSheetId,
      })
      .getExists();
  }

  public async postExp(user: User, body: InsertExpDto): Promise<Exp> {
    const newExp = this.expsRepository.create({
      user: user,
      questName: body.questName,
      exp: body.exp,
      expType: body.expType,
      expAt: body.expAt,
      week: body.week,
      period: body.period,
      content: body.content,
      achieveGrade: body.achieveGrade,
    });

    return await this.expsRepository.save(newExp);
  }
}
