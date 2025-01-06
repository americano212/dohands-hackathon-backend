import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { GoogleSheetService } from './common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetDataFromGoogleSheetDto } from './common/providers/dto';

@ApiTags('Test')
@Controller()
export class AppController {
  constructor(private readonly googleSheet: GoogleSheetService) {}

  @Get()
  healthCheck(): string {
    return 'Hello World';
  }

  @Get('/favicon.ico')
  @HttpCode(204)
  faviconCheck(): void {}

  @ApiOperation({ summary: 'Google Sheet 연동을 체크해보기 위한 API' })
  @ApiQuery({
    name: 'tabName',
    required: true,
    description: 'Google Sheet 하단 Tab 이름',
    example: 'member_info',
  })
  @ApiQuery({
    name: 'range',
    required: true,
    description: '조회할 데이터 범위',
    example: 'B10:B16',
  })
  @Get('/google-sheet')
  public async googleSheetTest(@Query() target: GetDataFromGoogleSheetDto): Promise<object> {
    return await this.googleSheet.getDataFromSheet(target);
  }
}
