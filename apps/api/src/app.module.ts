import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ComicsModule } from './comics/comics.module';
import { SitesModule } from './sites/sites.module';
import { ComicSitesModule } from './comic-sites/comic-sites.module';
import { ChaptersModule } from './chapters/chapters.module';
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
    ChaptersModule,
  ],
})
export class AppModule {}