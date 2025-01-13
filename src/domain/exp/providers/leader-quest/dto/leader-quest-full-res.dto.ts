import { ApiProperty } from '@nestjs/swagger';
import { QuestInfo } from './leader-quest-res.dto';

export class LeaderQuestFullResponseDto {
  @ApiProperty({ example: '음성 1센터', description: '소속' })
  public department!: string;

  @ApiProperty({ example: 1, description: '직무 그룹' })
  public jobGroup!: number;

  @ApiProperty({ example: 2, description: '퀘스트 개수' })
  public questCount!: number;

  @ApiProperty({ example: 40, description: '올해 총 획득한 경험치' })
  public totalExp!: number;

  @ApiProperty({ type: [QuestInfo], description: '리더부여 퀘스트 결과 [퀘스트1, 퀘스트2, ...]' })
  public questInfo!: QuestInfo[];
}
