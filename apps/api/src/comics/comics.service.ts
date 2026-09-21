import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComicsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.comic.findMany({
      orderBy: {
        title: 'asc',
      },
    });
  }
}