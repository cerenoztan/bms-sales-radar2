import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateSearchKeywordDto } from './dto/create-search-keyword.dto';
import { UpdateSearchKeywordDto } from './dto/update-search-keyword.dto';
import { SearchKeyword } from './search-keyword.entity';

@Injectable()
export class SearchKeywordService {
  constructor(
    @InjectRepository(SearchKeyword)
    private readonly keywordRepository:
      Repository<SearchKeyword>,
  ) {}

  findAll(): Promise<SearchKeyword[]> {
    return this.keywordRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findActive(): Promise<SearchKeyword[]> {
    return this.keywordRepository.find({
      where: {
        isActive: true,
      },
      order: {
        keyword: 'ASC',
      },
    });
  }

  async create(
    dto: CreateSearchKeywordDto,
  ): Promise<SearchKeyword> {
    const existing =
      await this.keywordRepository.findOne({
        where: {
          keyword: dto.keyword,
        },
      });

    if (existing) {
      throw new ConflictException(
        'Bu anahtar kelime zaten kayıtlı.',
      );
    }

    const keyword =
      this.keywordRepository.create({
        keyword: dto.keyword,
        isActive: true,
      });

    return this.keywordRepository.save(
      keyword,
    );
  }

  async update(
    id: number,
    dto: UpdateSearchKeywordDto,
  ): Promise<SearchKeyword> {
    const keyword =
      await this.keywordRepository.findOneBy({
        id,
      });

    if (!keyword) {
      throw new NotFoundException(
        'Anahtar kelime bulunamadı.',
      );
    }

    if (
      dto.keyword !== undefined &&
      dto.keyword !== keyword.keyword
    ) {
      const existing =
        await this.keywordRepository.findOne({
          where: {
            keyword: dto.keyword,
          },
        });

      if (existing) {
        throw new ConflictException(
          'Bu anahtar kelime zaten kayıtlı.',
        );
      }
    }

    this.keywordRepository.merge(
      keyword,
      dto,
    );

    return this.keywordRepository.save(
      keyword,
    );
  }

  async remove(id: number): Promise<void> {
    const keyword =
      await this.keywordRepository.findOneBy({
        id,
      });

    if (!keyword) {
      throw new NotFoundException(
        'Anahtar kelime bulunamadı.',
      );
    }

    await this.keywordRepository.remove(
      keyword,
    );
  }
}