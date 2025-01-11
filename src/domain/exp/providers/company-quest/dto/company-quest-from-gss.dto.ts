import { ApiProperty } from '@nestjs/swagger';
import { CreateExpDto } from '../../dto/create-exp.dto';

export class CompanyQuestFromGSSDto extends CreateExpDto {
  @ApiProperty({ example: '10', description: '구글 스프레드시트 index (행 번호)' })
  public override googleSheetId!: string;

  @ApiProperty({ example: new Date(), description: '경험치 획득 날짜' })
  public override expAt!: Date;

  @ApiProperty({ description: '퀘스트명' })
  public override questName!: string;
}
