import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}
  @Get()
  healthCheck(): string {
    return 'Health Check 200!';
  }
}
