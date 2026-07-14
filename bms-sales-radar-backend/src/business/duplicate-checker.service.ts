import { InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Business } from './business.entity';

@Injectable()
export class DuplicateCheckerService{
    constructor(
        @InjectRepository(Business)
        private readonly businessRepository:Repository<Business>
    ){}


  normalizePhone(phone?:string):string|undefined {
    if(!phone){
        return undefined;
    }
    // /D every character that is not a digit at everywhere
    let normalized=phone.replace(/\D/g, '');

    if(normalized.startsWith('90')){
        //slice(2) removes first two characters
        normalized=normalized.slice(2);
    }
    if(normalized.startsWith('0')){
        normalized=normalized.slice(1);
    }
    return normalized;
  }
  normalizeText(value?:string):string{
    if(!value){
        return '';
    }
    return value.toLocaleLowerCase('tr-TR').replace(/[^\p{L}\p{N}]/gu, '').trim();
  }
  normalizeInstagram(instagramUrl?:string):string|undefined{
    if(!instagramUrl){
        return undefined;
    }
    const username = instagramUrl
      .trim()
      .toLocaleLowerCase('tr-TR')
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/^instagram\.com\//, '')
      .replace(/^@/, '')
      .split(/[/?#]/)[0];

    return  `https://instagram.com/${username}` ;
  }
  async findDuplicate(
    phone?:string,
    instagramUrl?:string,
    name?:string,
    address?:string,
  ):Promise<Business | null >{
        const normalizedPhone=this.normalizePhone(phone);
        const normalizedInstagram=this.normalizeInstagram(instagramUrl);
        if(normalizedPhone){
            const business=await this.businessRepository.findOneBy({phone:normalizedPhone});
        
            if(business){
               return business;
            }
        }
        if(normalizedInstagram){
            const business=await this.businessRepository.findOneBy({instagramUrl:normalizedInstagram});
            if(business){
                return business;
            }
        }
        if( name && address){
            const businesses=await this.businessRepository.find();

            const duplicate=businesses.find(
                (business)=> business.name.toLocaleLowerCase('tr-TR').trim()==
                name.toLocaleLowerCase('tr-TR').trim() &&
                business.address.toLocaleLowerCase('tr-TR').trim()==
                address.toLocaleLowerCase('tr-TR').trim(),
            );

            if (duplicate){
                return duplicate;
            }
        }
        return null;
        
   }   

}   