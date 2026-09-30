import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ComicsModule } from './comics/comics.module';
import { SitesModule } from './sites/sites.module';
import { ComicSitesModule } from './comic-sites/comic-sites.module';
import { ReadingProgressModule } from './reading-progress/reading-progress.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ComicsModule,
    SitesModule,
    ComicSitesModule,
    ReadingProgressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}