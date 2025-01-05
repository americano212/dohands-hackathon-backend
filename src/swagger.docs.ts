import { DocumentBuilder } from '@nestjs/swagger';

export class APIDocument {
  public builder = new DocumentBuilder();

  public initializeOptions() {
    return this.builder
      .setTitle('두손꼭Do전! API')
      .setDescription(`두손꼭Do전!'s REST API Document`)
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();
  }
}
