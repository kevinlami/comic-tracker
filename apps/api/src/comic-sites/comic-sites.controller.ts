import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ComicSitesService } from './comic-sites.service';
import { CreateComicSiteDto } from './dto/create-comic-site.dto';
import { UpdateComicSiteDto } from './dto/update-comic-site.dto';

@Controller('comic-sites')
export class ComicSitesController {
  constructor(private readonly comicSitesService: ComicSitesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateComicSiteDto) {
    return this.comicSitesService.create(dto);
  }

  @Get()
  findAll() {
    return this.comicSitesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comicSitesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateComicSiteDto) {
    return this.comicSitesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.comicSitesService.remove(id);
  }
}
