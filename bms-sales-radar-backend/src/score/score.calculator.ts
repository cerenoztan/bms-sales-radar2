import { Injectable } from '@nestjs/common';
import { Business } from '../business/business.entity';
import { SalesPriority } from './sales-priority.enum';


export interface ScoreWeights{
    phone:number;
    instagramUrl:number;
    address:number;
}
export interface PriorityThresholds{
    veryHigh: number;
    high: number;
    medium: number;
    low: number;
}

export interface BusinessScoreResult {
  score: number;
  salesPriority: SalesPriority;
}

export interface ScoreResult{
    score:number;
    salesPriority:SalesPriority;
}

@Injectable()
export class ScoreService{

    private hasValue(value?:string):boolean{
     return typeof value=='string' && value.trim().length>0;
    }

    private readonly defaultWeights:ScoreWeights={
        phone:40,
        instagramUrl:25,
        address:35,
    };
    private readonly defaultThresholds:PriorityThresholds={
        veryHigh:80,
        high:60,
        medium:30,
        low:0,
    };

    calculate(business:Business,weights:ScoreWeights=this.defaultWeights,): number {
        let score=0;

        if(this.hasValue(business.phone)){
            score+=weights.phone;
        }
        if(
          this.hasValue(business.instagramUrl) ||
          this.hasValue(business.facebookUrl) ||
          this.hasValue(business.linkedinUrl) ||
          this.hasValue(business.jobPostingUrl)
        ){
            score+=weights.instagramUrl;
        }
        if(this.hasValue(business.address)){
            score+=weights.address;
        }

        const maxScore=weights.phone+weights.instagramUrl+weights.address;

        if(maxScore<=0){ //can be used for detecting errors
            return 0;
        }
        return score;
        //return Math.round((score / maximumScore) * 100); doğru kullanım bu mu ???

    }

    getSalesPriority(score:number,thresholds:PriorityThresholds=this.defaultThresholds,):SalesPriority{
            if (score >= thresholds.veryHigh) {
                return SalesPriority.VERY_HIGH;
            }

            if (score >= thresholds.high) {
                  return SalesPriority.HIGH;
            }

             if (score >= thresholds.medium) {
                  return SalesPriority.MEDIUM;
            }

            if (score >= thresholds.low) {
                 return SalesPriority.LOW;
            }
            return SalesPriority.LOW;// for safety 
    }
    evaluate(business:Business,weights?:ScoreWeights,thresholds?:PriorityThresholds,): BusinessScoreResult{
        const score=this.calculate(business,weights);
        const salesPriority=this.getSalesPriority(score,thresholds);

        return{
        score,
        salesPriority,
        };
    }
    createScoredBusiness(business:Business,weights?:ScoreWeights,thresholds?:PriorityThresholds,):Business{
        const result=this.evaluate(business,weights,thresholds);
         return {// copying all existing properites into a new object 
         ...business,
         score: result.score,
        salesPriority: result.salesPriority,
        };
    }

}



// with injectable NestJS manages the ScoreService class 
//importing Business class at the beginning 
//Service'ler @Injectable() olur; Entity, DTO, Enum ve Interface'ler olmaz.

//score döndürmeye gerek var mı ???
