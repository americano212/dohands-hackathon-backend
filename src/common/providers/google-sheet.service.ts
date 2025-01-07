import { google } from 'googleapis';
import { ConfigService } from './config.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { GetValueFromGoogleSheetDto, WriteValueToGoogleSheetDto } from './dto';

@Injectable()
export class GoogleSheetService {
  constructor(private config: ConfigService) {}

  public async getValueFromSheet(target: GetValueFromGoogleSheetDto): Promise<object> {
    const client_email = this.config.get('googleSheet.client_email');
    const private_key = this.config
      .get('googleSheet.private_key')
      .split(String.raw`\n`)
      .join('\n');
    if (client_email === '' || private_key === '')
      throw Error(`googleSheet credencials Not Exist in .env`);

    const spread_sheet_id = this.config.get('googleSheet.spread_sheet_id');
    if (!spread_sheet_id) throw Error('invalid spread sheet id');

    const authorize = new google.auth.JWT({
      email: client_email,
      key: private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const googleSheet = google.sheets({
      version: 'v4',
      auth: authorize,
    });

    const context = await googleSheet.spreadsheets.values.get({
      spreadsheetId: spread_sheet_id,
      range: `${target.tabName}!${target.range}`,
    });

    return context.data;
  }

  public async writeValueFromSheet(target: WriteValueToGoogleSheetDto): Promise<object> {
    const client_email = this.config.get('googleSheet.client_email');
    const private_key = this.config
      .get('googleSheet.private_key')
      .split(String.raw`\n`)
      .join('\n');
    if (client_email === '' || private_key === '')
      throw Error(`googleSheet credencials Not Exist in .env`);

    const spread_sheet_id = this.config.get('googleSheet.spread_sheet_id');
    if (!spread_sheet_id) throw Error('invalid spread sheet id');

    const authorize = new google.auth.JWT({
      email: client_email,
      key: private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const googleSheet = google.sheets({
      version: 'v4',
      auth: authorize,
    });

    try {
      const response = await googleSheet.spreadsheets.values.update({
        spreadsheetId: spread_sheet_id,
        range: `${target.tabName}!${target.range}`,
        valueInputOption: 'RAW',
        requestBody: {
          range: `${target.tabName}!${target.range}`,
          values: [[target.inputValue]],
        },
      });
      return response;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }
}
