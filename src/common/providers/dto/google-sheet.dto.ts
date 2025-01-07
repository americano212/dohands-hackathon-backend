export class GetValueFromGoogleSheetDto {
  public tabName!: string;
  public range!: string;
}

export class WriteValueToGoogleSheetDto extends GetValueFromGoogleSheetDto {
  public inputValue!: string | number;
}
