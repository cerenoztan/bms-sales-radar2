import {Injectable,NotFoundException,BadRequestException} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaveSearchResultDto } from './dto/save-search-result.dto';
import { Business } from '../business/business.entity';
import { Source } from './source.entity';

@Injectable()
export class SourceService{
    constructor(
        //NestJS creates the repository and injects to the service 
        // because it acknowledges the entity
        @InjectRepository(Source)
        private readonly sourceRepository:Repository<Source>,

        @InjectRepository(Business)
        private readonly businessRepository: Repository<Business>,
    ){}

    async create(
     name: string,
    url: string,
    externalId?: string,
    businessID?: number,
        ): Promise<Source> {
     const existingSource = externalId
     ? await this.sourceRepository.findOne({
        where: { externalId },
        relations: { business: true },
      })
    : await this.sourceRepository.findOne({
        where: { url },
        relations: { business: true },
      });

    if (existingSource) {
    return existingSource;
    }

    let business: Business | undefined;

    if (businessID !== undefined) {
    const foundBusiness =
      await this.businessRepository.findOneBy({
        id: businessID,
      });

    if (!foundBusiness) {
      throw new NotFoundException(
        `Business with ID ${businessID} was not found`,
      );
    }

    business = foundBusiness;
    }

    const source = this.sourceRepository.create({
    name,
    url,
    externalId,
    business,
    });

        return this.sourceRepository.save(source);
    }
    async saveSearchResult(
  dto: SaveSearchResultDto,
): Promise<Source> {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(dto.url);
  } catch {
    throw new BadRequestException(
      'Geçersiz kaynak adresi.',
    );
  }

  if (parsedUrl.protocol !== 'https:') {
    throw new BadRequestException(
      'Yalnızca HTTPS adresleri kabul edilir.',
    );
  }

  const hostname = parsedUrl.hostname
    .toLocaleLowerCase('en-US')
    .replace(/^www\./, '');

  const pathParts = parsedUrl.pathname
    .split('/')
    .filter(Boolean);

  if (dto.platform === 'INSTAGRAM') {
    const blockedInstagramPaths = new Set([
      'accounts',
      'direct',
      'explore',
      'p',
      'reel',
      'reels',
      'stories',
    ]);

    const username = pathParts[0];

    if (
      hostname !== 'instagram.com' ||
      pathParts.length !== 1 ||
      !username ||
      blockedInstagramPaths.has(
        username.toLocaleLowerCase('en-US'),
      )
    ) {
      throw new BadRequestException(
        'Yalnızca Instagram profil adresleri kaydedilebilir.',
      );
    }
  }

  if (dto.platform === 'LINKEDIN') {
    if (
      hostname !== 'linkedin.com' ||
      pathParts[0] !== 'company' ||
      !pathParts[1]
    ) {
      throw new BadRequestException(
        'Yalnızca LinkedIn şirket sayfaları kaydedilebilir.',
      );
    }
  }

  parsedUrl.hostname = hostname;
  parsedUrl.search = '';
  parsedUrl.hash = '';

  parsedUrl.pathname =
    `/${pathParts.join('/')}/`;

  const normalizedUrl = parsedUrl.toString();

  const externalId = [
    'GOOGLE_PSE',
    dto.platform,
    normalizedUrl,
  ].join(':');

  return this.create(
    dto.name.trim(),
    normalizedUrl,
    externalId,
  );
 }
    async findSources():Promise<Source[]>{
        return this.sourceRepository.find({
            //relations shows the relationship that is defined with one to many and many to one
            relations:{
                business:true,
            },
        } );
    }

    async findByBusiness(businessID:number,): Promise<Source[]>{
        return this.sourceRepository.find({
            //where is the filter 
            //only the source data base for specific businessID
            where:{
                business:{
                    id:businessID,
                },
            },
            relations:{
                business:true,
            },
        });
    }
    // {id} because passing an object 
    async remove(id:number):Promise<void>{
        const source=await this.sourceRepository.findOneBy({id});

        if(!source){
            throw new NotFoundException(
                 `Source with ID ${id} was not found`,
            );
        }
        await this.sourceRepository.remove(source);
    }
    async findByExternalId(
        externalId: string,
        ): Promise<Source | null> {
         return this.sourceRepository.findOne({
          where: { externalId },
          relations: {
           business: true,
          },
        });
    }
    async findByUrl(
  url: string,
 ): Promise<Source | null> {
  return this.sourceRepository.findOne({
    where: { url },
    relations: {
      business: true,
    },
  });
 }   


    
}

//Entity → describes the database table.
//Repository → performs database operations on that table.
//Service → contains the business logic and coordinates one or more repositories.
//Controller → receives HTTP requests and calls the service.


