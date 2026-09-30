import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ComicsService } from './comics.service';
import { CreateComicDto } from './dto/create-comic.dto';
import { UpdateComicDto } from './dto/update-comic.dto';
import { ListComicsQueryDto } from './dto/list-comics.query.dto';

@Controller('comics')
export class ComicsController {
  constructor(private readonly comicsService: ComicsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateComicDto) {
    return this.comicsService.create(dto);
  }

  @Get()
  findAll(@Query() query: ListComicsQueryDto) {
    return this.comicsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comicsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateComicDto) {
    return this.comicsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.comicsService.remove(id);
  }
}
