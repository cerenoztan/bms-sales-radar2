import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { GoogleSearchResult } from './interfaces/google-search.interface';

interface GoogleCustomSearchItem {
  title?: string;
  link?: string;
}

interface GoogleCustomSearchResponse {
  items?: GoogleCustomSearchItem[];
  error?: {
    message?: string;
  };
}

@Injectable()
export class GoogleSearchService {
  private readonly logger = new Logger(
    GoogleSearchService.name,
  );

  private readonly endpoint =
    'https://customsearch.googleapis.com/customsearch/v1';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async search(
    keyword: string,
    limit = 10,
  ): Promise<GoogleSearchResult[]> {
    const normalizedKeyword = keyword.trim();

    if (!normalizedKeyword) {
      return [];
    }

    const apiKey =
      this.configService.get<string>(
        'GOOGLE_API_KEY',
      );

    const searchEngineId =
      this.configService.get<string>(
        'GOOGLE_ENGINE_ID',
      );
      

    if (!apiKey || !searchEngineId) {
      throw new ServiceUnavailableException(
        'Google Search API bilgileri tanımlanmamış.',
      );
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<GoogleCustomSearchResponse>(
          this.endpoint,
          {
            params: {
              key: apiKey,
              cx: searchEngineId,
              q: normalizedKeyword,
              num: Math.min(Math.max(limit, 1), 10),
              hl: 'tr',
              gl: 'tr',
            },
            timeout: 30_000,
          },
        ),
      );

      if (response.data.error?.message) {
        throw new Error(
          response.data.error.message,
        );
      }

      const results = (response.data.items ?? [])
        .filter(
          (
            item,
          ): item is GoogleCustomSearchItem & {
            title: string;
            link: string;
          } =>
            Boolean(item.title && item.link),
        )
        .map((item) => ({
          title: item.title.trim(),
          url: item.link,
        }));

      return this.removeDuplicates(results);
    } catch (error: unknown) {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const responseData = error.response?.data;

    this.logger.error(
      `Google Search API hatası
Status: ${status ?? 'bilinmiyor'}
Response: ${JSON.stringify(responseData, null, 2)}`,
    );

    throw new ServiceUnavailableException({
      message: 'Google arama sonuçları alınamadı.',
      googleStatus: status,
      googleError: responseData,
    });
  }

  const message =
    error instanceof Error
      ? error.message
      : 'Bilinmeyen hata';

  this.logger.error(
    `Google Search API beklenmeyen hata: ${message}`,
    error instanceof Error ? error.stack : undefined,
  );

  throw new ServiceUnavailableException({
    message: 'Google arama sonuçları alınamadı.',
    detail: message,
  });
}
  }

  private removeDuplicates(
    results: GoogleSearchResult[],
  ): GoogleSearchResult[] {
    return Array.from(
      new Map(
        results.map((result) => [
          result.url,
          result,
        ]),
      ).values(),
    );
  }
}