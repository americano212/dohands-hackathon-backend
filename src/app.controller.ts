import { Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { GoogleSheetService } from './common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetValueFromGoogleSheetDto, WriteValueToGoogleSheetDto } from './common/providers/dto';

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
    example: 'B10:V11',
  })
  @Get('/google-sheet')
  public async getFromGoogleSheet(@Query() target: GetValueFromGoogleSheetDto): Promise<object> {
    return await this.googleSheet.getValueFromSheet(target);
  }

  @ApiOperation({ summary: 'Google Sheet write 연동을 체크해보기 위한 API' })
  @ApiQuery({
    name: 'tabName',
    required: true,
    description: 'Google Sheet 하단 Tab 이름',
    example: 'member_info',
  })
  @ApiQuery({
    name: 'range',
    required: true,
    description: '변경할 데이터 범위',
    example: 'J10',
  })
  @ApiQuery({
    name: 'inputValue',
    required: true,
    description: '입력할 데이터',
    example: 'Tpassword',
  })
  @Post('/google-sheet')
  public async writeToGoogleSheet(@Query() target: WriteValueToGoogleSheetDto): Promise<object> {
    return await this.googleSheet.writeValueFromSheet(target);
  }
}
