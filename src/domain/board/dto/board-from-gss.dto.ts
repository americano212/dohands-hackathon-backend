import { ApiProperty } from '@nestjs/swagger';
import { CreateBoardDto } from './create-board.dto';

export class BoardFromGSSDto extends CreateBoardDto {
  @ApiProperty({ example: '10', description: 'google sheet address' })
  public override googleSheetId!: string;
}
