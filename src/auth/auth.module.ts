import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import jwtConfig from 'src/config/jwt/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { HashingService } from 'src/common/hashing.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GoogleStrategy } from './strategy/google.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
        signOptions: {
          expiresIn: config.get('jwt.expiresIn'),
        },
      }),
    }),
  ],
  providers: [AuthService, HashingService, JwtStrategy, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
