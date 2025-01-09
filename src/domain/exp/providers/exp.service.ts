import { Injectable, NotFoundException } from '@nestjs/common';
import { ExpsRepository } from '../exp.repository';
import { GoogleSheetService } from 'src/common';
import { ExpResponseDto } from './dto';
import { ExpStatusResponseDto } from './dto/exp-status-res.dto';
import { UsersRepository } from 'src/shared/user/user.repository';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PerformanceFromGSSDto } from './performance/dto';

@Injectable()
export class ExpService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly expsRepository: ExpsRepository,
    private readonly gssService: GoogleSheetService,
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
    const h1Range = 'B10:E16';
    const h2Range = 'H10:K16';
    const jobRange = 'B15:I67';
    const leaderRange = 'B10:H31';
    const companyRange = 'B8:I12';
    // 상반기 인사평가
    await this.processPerformanceGSS('인사평가', h1Range, 1);
    // 하반기 인사평가
    await this.processPerformanceGSS('인사평가', h2Range, 2);

    // 직무별 퀘스트
    await this.processJobQuestGSS('직무별 퀘스트', jobRange);

    await this.processLeaderQuestGSS('리더부여 퀘스트', leaderRange);

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
      if (value[0] === '' || value[1] === '' || value[2] === '' || value[3] === '') continue;
      const user = await this.usersRepository.findOneByEmployeeId(value[0]);
      if (!user) {
        throw new NotFoundException(`Not Found user_id ${value[0]}`);
      }
      const exp: PerformanceFromGSSDto = {
        googleSheetId: `${idx + 10}`,
        user: user,
        result: value[2],
        exp: Number(value[3]),
        expAt: new Date(),
        expType: `H${quarter}`,
      };

      const isExist = await this.expsRepository.isExistGoogleSheetId(exp);

      if (isExist) {
        await this.expsRepository.updatePerformance(exp.googleSheetId, exp.expType, {
          user: exp.user,
          expAt: exp.expAt,
          exp: exp.exp,
          result: exp.result,
        });
      } else {
        await this.expsRepository.create(exp);
      }
    }
    return true;
  }

  public async processJobQuestGSS(tabName: string, range: string): Promise<boolean> {
    //todo
    return tabName + range ? true : false;
  }

  public async processLeaderQuestGSS(tabName: string, range: string): Promise<boolean> {
    //todo
    return tabName + range ? true : false;
  }

  public async processCompanyQuestGSS(tabName: string, range: string): Promise<boolean> {
    //todo
    return tabName + range ? true : false;
  }
}
