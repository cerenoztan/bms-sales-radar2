import{Injectable,NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Business } from './business.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { ScoreService } from '../score/score.calculator';
import { DuplicateCheckerService } from './duplicate-checker.service';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    private readonly scoreService:ScoreService,
    private readonly duplicateChecker:DuplicateCheckerService,
  ) {}

  //büyükten küçüğe sıralamak için
  async findAllSortedByScore(): Promise<Business[]> {
    return this.businessRepository.find({
      order: {
        score: 'DESC',
      },
    });
  }
  //after controller create will do a lot of work
  async create(createBusinessDto:CreateBusinessDto,): Promise<Business>{

     const phone=this.duplicateChecker.normalizePhone(createBusinessDto.phone,);
     const instagramUrl=this.duplicateChecker.normalizeInstagram(createBusinessDto.instagramUrl,);
     const facebookUrl=this.duplicateChecker.normalizeFacebook(createBusinessDto.facebookUrl,);

     const duplicate=await this.duplicateChecker.findDuplicate(
       phone,
       instagramUrl,
       facebookUrl,
       createBusinessDto.name,
       createBusinessDto.address,
       createBusinessDto.googlePlaceId,
       createBusinessDto.discoverySource,
     );

     if(duplicate){
      this.businessRepository.merge(duplicate,{...createBusinessDto,
        // use phone if exists otherwise merge the new phone
        phone:phone ?? duplicate.phone,
        instagramUrl:instagramUrl??duplicate.instagramUrl,
        facebookUrl:facebookUrl ?? duplicate.facebookUrl,
        googleMapsUrl:createBusinessDto.googleMapsUrl ?? duplicate.googleMapsUrl,
        googlePlaceId:createBusinessDto.googlePlaceId ?? duplicate.googlePlaceId,
        discoverySource:createBusinessDto.discoverySource ?? duplicate.discoverySource,
      });

      const scoredBusiness=this.scoreService.createScoredBusiness(duplicate);
      return this.businessRepository.save(scoredBusiness);
     }

    //creating a Business object from DTO
    const business= this.businessRepository.create({...createBusinessDto,phone,instagramUrl,facebookUrl});

    const scoredBusiness=this.scoreService.createScoredBusiness(business);
    //saving the object to the database
    return this.businessRepository.save(scoredBusiness);

  }
  async findOne(id:number):Promise<Business>{
    const business=await this.businessRepository.findOneBy({id,});
    if(!business){
        throw new NotFoundException(
             `Business with ID ${id} was not found`,
        );
    }
    return business;

  }

  async update(id:number,updateBusinessDto:UpdateBusinessDto,):Promise<Business>{
    const business=await this.businessRepository.findOneBy({id,});
    if(!business){
        throw new NotFoundException(
             `Business with ID ${id} was not found`,
        );
    }
    this.businessRepository.merge(business,updateBusinessDto,);

    const scoredBusiness=this.scoreService.createScoredBusiness(business);
    return this.businessRepository.save(scoredBusiness);
  }

  //findOneBy is a repository method
  async remove(id:number):Promise<void>{
    const business= await this.findOne(id);
    await this.businessRepository.remove(business);
  }
  


 
}

//Use async if your service API is intentionally promise-based for consistency.

//REST API
//create service-> post 
//read service 
//update service
//delete service

//dto =data transfer object : frontend veya API isteğinden gelen veriyi taşımak ve doğrulamak için kullanılan bir nesnedir.
//API katmanı (DTO) ile veritabanı katmanı (Entity) birbirinden bağımsız kalır
