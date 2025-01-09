import { Exp } from '#entities/exp.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdatePerformanceDto } from './providers/performance/dto';
import { NullableType } from 'src/common/types';
import { ExpStatusResponseDto } from './providers/dto/exp-status-res.dto';
import { CreateExpDto } from './providers/dto';

// 직군 키 타입
type JobFamily = 'F' | 'B' | 'G' | 'T';

// 레벨 테이블
const levelTable: Record<JobFamily, { level: string; exp: number }[]> = {
  F: [
    { level: 'F1-Ⅰ', exp: 0 },
    { level: 'F1-Ⅱ', exp: 13500 },
    { level: 'F2-Ⅰ', exp: 27000 },
    { level: 'F2-Ⅱ', exp: 39000 },
    { level: 'F2-Ⅲ', exp: 51000 },
    { level: 'F3-Ⅰ', exp: 63000 },
    { level: 'F3-Ⅱ', exp: 78000 },
    { level: 'F3-Ⅲ', exp: 93000 },
    { level: 'F4-Ⅰ', exp: 108000 },
    { level: 'F4-Ⅱ', exp: 126000 },
    { level: 'F4-Ⅲ', exp: 144000 },
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
      .where('exp.user = :user', { user })
      .andWhere('YEAR(exp.expAt) = :year', { year: currentYear })
      .getRawOne()
      .then((result) => Number(result.totalExp) || 0); // 합계가 없을 경우 0으로 처리

    /*
    // 옛날부터 작년까지의 경험치 합계 가져오기
    const lastYearExp = await this.expsRepository
      .createQueryBuilder('exp')
      .select('SUM(exp.exp)', 'totalExp')
      .where('exp.userId = :userId', { userId })
      .andWhere('YEAR(exp.expAt) <= :year', { year: lastYear }) // 작년 이하 조건
      .getRawOne()
      .then((result) => Number(result.totalExp) || 0);
    */

    // 연도별 경험치 합계 가져오기 (올해 제외)
    const lastYearExpList = await this.expsRepository
      .createQueryBuilder('exp')
      .select('YEAR(exp.expAt)', 'year') // 연도별 그룹화
      .addSelect('SUM(exp.exp)', 'exp') // 경험치 합계
      .where('exp.user = :userId', { user }) // 유저 필터링
      .andWhere('YEAR(exp.expAt) < :year', { year: currentYear }) // 올해 데이터 제외
      .groupBy('YEAR(exp.expAt)') // 연도로 그룹화
      .orderBy('YEAR(exp.expAt)', 'ASC') // 연도 오름차순 정렬
      .getRawMany();

    // 결과 변환 (year와 exp를 객체 형태로 변환)
    const formattedExpList = lastYearExpList.map((row) => ({
      year: Number(row.year),
      exp: Number(row.exp),
    }));

    const lastYearExp = formattedExpList.reduce((sum, item) => sum + item.exp, 0);
    const totalExp = currentYearExp + lastYearExp;

    if (!jobFamily || !['F', 'B', 'G', 'T'].includes(jobFamily)) {
      jobFamily = 'F';
    }

    // 직군에 맞는 레벨 테이블 가져오기
    const levels = levelTable[jobFamily as JobFamily];

    if (!levels) {
      throw new Error('Invalid jobFamily provided.');
    }

    // 현재 레벨 계산
    const currentLevelIndex = levels.findIndex((level) => lastYearExp >= level.exp);
    const currentLevel = currentLevelIndex >= 0 ? levels[currentLevelIndex].level : levels[0].level;

    // 예상 레벨 계산
    const expectedLevelIndex = levels.findIndex((level) => totalExp >= level.exp);
    const expectedLevel =
      expectedLevelIndex >= 0 ? levels[expectedLevelIndex].level : levels[0].level;

    // expToNextLevel 계산
    const expToNextLevel =
      currentLevelIndex + 1 < levels.length ? levels[currentLevelIndex + 1].exp - totalExp : 0;

    return {
      currentLevel: currentLevel,
      expectedLevel: expectedLevel,
      currentYearExp,
      lastYearExp: lastYearExp,
      lastYearExpList: formattedExpList,
      expToNextLevel: expToNextLevel,
    };
  }

  //추가 메서드
  public async create(expData: CreateExpDto): Promise<Exp> {
    return await this.expsRepository.save(await this.expsRepository.create(expData));
  }

  //사원번호와 기입한 연도, 상하반기(H1,H2)가 같은 경우에만 update
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

  //올해 인사평가 결과 가져오기
  public async getPerformance(userId: number, quarter: number): Promise<NullableType<Exp>> {
    const currentYear = new Date().getFullYear();
    if (quarter === 1) {
      return await this.expsRepository
        .createQueryBuilder('exp')
        .where('exp.user = :userId', { userId: userId })
        .andWhere('exp.expType = :expType', { expType: 'H1' })
        .andWhere('YEAR(exp.expAt) = :year', { year: currentYear })
        .getOne();
    } else {
      return await this.expsRepository
        .createQueryBuilder('exp')
        .where('exp.user = :userId', { userId: userId })
        .andWhere('exp.expType = :expType', { expType: 'H2' })
        .andWhere('YEAR(exp.expAt) = :year', { year: currentYear })
        .getOne();
    }
  }

  public async isExistGoogleSheetId(createExpDto: CreateExpDto): Promise<boolean> {
    if (createExpDto.expType[0] === 'H') {
      return await this.expsRepository
        .createQueryBuilder('exp')
        .andWhere('exp.expType = :expType', { expType: createExpDto.expType })
        .andWhere('exp.googleSheetId = :googleSheetId', {
          googleSheetId: createExpDto.googleSheetId,
        })
        .getExists();
    }

    // TODO 나머지 퀘스트들에 대해 exist 판단
    return await this.expsRepository
      .createQueryBuilder('exp')
      .where('exp.googleSheetId = :googleSheetId', { googleSheetId: createExpDto.googleSheetId })
      .andWhere('exp.userId = :userId', { userId: createExpDto.user.id })
      .getExists();
  }
}
