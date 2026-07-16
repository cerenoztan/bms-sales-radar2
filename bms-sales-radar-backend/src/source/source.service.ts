import {Injectable,NotFoundException,} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
        businessID:number,
        name:string,
        url:string,
    ):Promise<Source>{
        //the actual Business object from the database
        //TypeORM takes the ID and stores into businessID
        const business= await this.businessRepository.findOneBy({id:businessID,});
        if(!business){
            throw new NotFoundException(
              `Business with ID ${businessID} was not found`
            );
        }
        const source=this.sourceRepository.create({
            name,
            url,
            business,
        });
        return this.sourceRepository.save(source);
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

    async remove(id:number):Promise<void>{
        const source=await this.sourceRepository.findOneBy({id});

        if(!source){
            throw new NotFoundException(
                 `Source with ID ${id} was not found`,
            );
        }
        await this.sourceRepository.remove(source);
    }

    
}

//Entity → describes the database table.
//Repository → performs database operations on that table.
//Service → contains the business logic and coordinates one or more repositories.
//Controller → receives HTTP requests and calls the service.
