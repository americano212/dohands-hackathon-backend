import { Injectable } from '@nestjs/common';
import { CompanyQuestResponseDto } from './dto/company-quest-res.dto';
import { ExpsRepository } from '../../exp.repository';
@Injectable()
export class CompanyQuestService {
  constructor(private expsRepository: ExpsRepository) {}
  public async getCompanyQuest(userId: number): Promise<CompanyQuestResponseDto[]> {
    const results = await this.expsRepository.getCompanyQuest(userId);

    return results.map((result) => ({
      expAt: result.expAt,
      period: result.period || '',
      questName: result.questName,
      content: result.content || '',
      exp: result.exp,
    }));
  }
}
