import { ApiProperty } from '@nestjs/swagger';

export class LocalLoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInV...',
    description: '인가를 위한 Access Token',
  })
  accessToken!: string;
}
