import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HashingService } from 'src/common/hashing.service';

@Module({
  providers: [UsersService, HashingService],
  controllers: [UsersController],
  imports: [PrismaModule],
})
export class UsersModule {}
