import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ComicsModule } from './comics/comics.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ComicsModule,
  ],
})
export class AppModule {}