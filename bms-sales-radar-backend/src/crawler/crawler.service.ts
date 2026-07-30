import {
  Injectable,
  Logger,
} from '@nestjs/common';

import { GoogleSearchService } from '../google/google-search.service';
import { SourceService } from '../source/source.service';
import { Source } from '../source/source.entity';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(
    CrawlerService.name,
  );

  constructor(
    private readonly googleSearchService:
      GoogleSearchService,
    private readonly sourceService:
      SourceService,
  ) {}

  async previewGoogleSearch(
    keyword: string,
  ) {
    const normalizedKeyword =
      keyword?.trim();

    if (!normalizedKeyword) {
      return [];
    }

    return this.googleSearchService.search(
      normalizedKeyword,
    );
  }

  async runGoogleSearch(
    keyword: string,
  ) {
    const normalizedKeyword =
      keyword?.trim();

    if (!normalizedKeyword) {
      return {
        keyword: '',
        found: 0,
        created: 0,
        skipped: 0,
        failed: 0,
        sources: [],
      };
    }

    const results =
      await this.googleSearchService.search(
        normalizedKeyword,
      );

    const savedSources: Source[] = [];

    let skipped = 0;
    let failed = 0;

    for (const result of results) {
      try {
        const existingSource =
          await this.sourceService.findByUrl(
            result.url,
          );

        if (existingSource) {
          skipped++;

          this.logger.log(
            `URL zaten mevcut, atlandı: ${result.url}`,
          );

          continue;
        }

        const source =
          await this.sourceService.create(
            result.title,
            result.url,
          );

        savedSources.push(source);

        this.logger.log(
          `Source oluşturuldu: ${result.title}`,
        );
      } catch (error: unknown) {
        failed++;

        const message =
          error instanceof Error
            ? error.message
            : 'Bilinmeyen hata';

        this.logger.error(
          `Source kaydedilemedi: ${result.url} - ${message}`,
        );
      }
    }

    return {
      keyword: normalizedKeyword,
      found: results.length,
      created: savedSources.length,
      skipped,
      failed,
      sources: savedSources,
    };
  }
}