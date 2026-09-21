import { Module } from '@nestjs/common';
import { ComicSitesService } from './comic-sites.service';
import { ComicSitesController } from './comic-sites.controller';

@Module({
  providers: [ComicSitesService],
  controllers: [ComicSitesController],
})
export class ComicSitesModule {}
