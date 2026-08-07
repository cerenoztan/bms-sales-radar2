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

    const trimmedUrl = instagramUrl.trim();

    try {
      const urlValue = trimmedUrl.startsWith('@')
        ? `https://instagram.com/${trimmedUrl.slice(1)}`
        : trimmedUrl.match(/^https?:\/\//i)
          ? trimmedUrl
          : `https://${trimmedUrl}`;

      const parsedUrl = new URL(urlValue);
      const hostname = parsedUrl.hostname
        .toLocaleLowerCase('en-US')
        .replace(/^www\./, '');

      if (hostname !== 'instagram.com') {
        return trimmedUrl;
      }

      const pathParts = parsedUrl.pathname
        .split('/')
        .filter(Boolean);

      if (!pathParts.length) {
        return 'https://instagram.com';
      }

      const contentPaths = new Set(['p', 'reel', 'reels', 'tv']);
      const firstPath = pathParts[0].toLocaleLowerCase('en-US');

      if (contentPaths.has(firstPath) && pathParts[1]) {
        return `https://instagram.com/${firstPath}/${pathParts[1]}`;
      }

      return `https://instagram.com/${firstPath}`;
    } catch {
      return trimmedUrl;
    }
  }

  normalizeFacebook(facebookUrl?: string): string | undefined {
    if (!facebookUrl) {
      return undefined;
    }

    try {
      const parsedUrl = new URL(facebookUrl.trim());
      const hostname = parsedUrl.hostname
        .toLocaleLowerCase('en-US')
        .replace(/^(www|m)\./, '');

      if (hostname !== 'facebook.com') {
        return facebookUrl.trim();
      }

      const path = parsedUrl.pathname.replace(/\/+$/, '');
      return `https://facebook.com${path}`;
    } catch {
      return facebookUrl.trim();
    }
  }

  async findDuplicate(
    phone?:string,
    instagramUrl?:string,
    facebookUrl?: string,
    name?:string,
    address?:string,
    googlePlaceId?: string,
    discoverySource?: string,
  ):Promise<Business | null >{
        const normalizedPhone=this.normalizePhone(phone);
        const normalizedInstagram=this.normalizeInstagram(instagramUrl);
        const normalizedFacebook=this.normalizeFacebook(facebookUrl);

        if(normalizedInstagram){
            const business=await this.businessRepository.findOneBy({instagramUrl:normalizedInstagram});
            if(business){
                return business;
            }
        }

        if(normalizedFacebook){
            const business=await this.businessRepository.findOneBy({facebookUrl:normalizedFacebook});
            if(business){
                return business;
            }
        }

        if (discoverySource === 'INSTAGRAM' || discoverySource === 'FACEBOOK') {
            return null;
        }

        if (googlePlaceId) {
            const business = await this.businessRepository.findOneBy({ googlePlaceId });
            if (business) {
                return business;
            }
        }
        
        if(normalizedPhone){
            const business=await this.businessRepository.findOneBy({phone:normalizedPhone});
        
            if(business){
               return business;
            }
        }
        if( name && address){
            const businesses=await this.businessRepository.find();

            const duplicate=businesses.find(
                (business)=> business.name.toLocaleLowerCase('tr-TR').trim()==
                name.toLocaleLowerCase('tr-TR').trim() &&
                this.normalizeText(business.address).toLocaleLowerCase('tr-TR').trim()==
                address.toLocaleLowerCase('tr-TR').trim(),
            );

            if (duplicate){
                return duplicate;
            }
        }
        return null;
        
   }   

}   
