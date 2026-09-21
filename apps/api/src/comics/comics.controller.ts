import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ComicsService } from './comics.service';
import { CreateComicDto } from './dto/create-comic.dto';

@Controller('comics')
export class ComicsController {
  constructor(private readonly comicsService: ComicsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateComicDto) {
    return this.comicsService.create(dto);
  }

  @Get()
  findAll() {
    return this.comicsService.findAll();
  }
}
