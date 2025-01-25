import { DocumentBuilder } from '@nestjs/swagger';

export class APIDocument {
  public builder = new DocumentBuilder();

  public initializeOptions() {
    return this.builder
      .setTitle(`HandsUp's API`)
      .setDescription(`HandsUp's REST API Document`)
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();
  }
}
