import { ApiProperty } from '@nestjs/swagger';
import { CreateExpDto } from '../../dto/create-exp.dto';

export class JobQuestFromGSSDto extends CreateExpDto {
  @ApiProperty({ example: '10', description: '구글 스프레드시트 index (행 번호)' })
  public override googleSheetId!: string;

  @ApiProperty({ example: new Date(), description: '경험치 획득 날짜' })
  public override expAt!: Date;

  @ApiProperty({
    example: 'MAX',
    description: '달성 내용 ex)MAX, MEDIAN',
  })
  public override result!: string;

  @ApiProperty({
    example: 'week',
    description: '직무별 퀘스트/리더부여 퀘스트에서 주기',
  })
  public override period!: string;
}
