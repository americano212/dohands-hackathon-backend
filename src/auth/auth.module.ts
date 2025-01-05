import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { UserModule } from '../shared/user/user.module';
import { LocalStrategy, JwtStrategy } from './strategies';
import { AuthSerializer } from './auth.serializer';

@Global()
@Module({
  imports: [JwtModule.register({}), UserModule],
  providers: [AuthService, LocalStrategy, JwtStrategy, AuthSerializer],
  exports: [AuthService],
})
export class AuthModule {}
