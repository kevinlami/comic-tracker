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
import { ReadingProgressService } from './reading-progress.service';
import { CreateReadingProgressDto } from './dto/create-reading-progress.dto';
import { UpdateReadingProgressDto } from './dto/update-reading-progress.dto';

@Controller('reading-progress')
export class ReadingProgressController {
  constructor(private readonly readingProgressService: ReadingProgressService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateReadingProgressDto) {
    return this.readingProgressService.create(dto);
  }

  @Get()
  findAll() {
    return this.readingProgressService.findAll();
  }

  @Get(':comicId')
  findOne(@Param('comicId') comicId: string) {
    return this.readingProgressService.findOneByComicId(comicId);
  }

  @Patch(':comicId')
  update(@Param('comicId') comicId: string, @Body() dto: UpdateReadingProgressDto) {
    return this.readingProgressService.update(comicId, dto);
  }

  @Delete(':comicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('comicId') comicId: string) {
    return this.readingProgressService.remove(comicId);
  }
}
