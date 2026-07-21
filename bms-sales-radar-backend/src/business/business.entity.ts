import{
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Source } from '../source/source.entity';
import { SalesPriority } from "../score/sales-priority.enum";
import { BusinessStatus } from "./business-status.enum";
import { BusinessType } from '../crawler/crawler-business-type.enum';
import { IsOptional } from 'class-validator';

@Entity('businesses')
export class Business {

  @PrimaryGeneratedColumn()
  //normally generates number
  id!:number;

  @Column({
    type:'text',
    default:BusinessStatus.NEW,
  })
  status!:BusinessStatus;

  @Column({
  type: 'text',
  default: BusinessType.OTHER,
  })
  type!: BusinessType;
  
  @Column()
  name!: string;

  @Column({nullable:true})
  instagramUrl?: string;

  @Column({nullable:true})
  address?: string;

  @Column({nullable:true})//can be null
  phone?: string;

  @Column({ 
    type: 'integer',
    default: 0,
  })
  score?: number;

  @Column({
      type:'text',
      default:SalesPriority.LOW,
  })
  salesPriority?: SalesPriority;

  @OneToMany(()=> Source,(source)=>source.business)
  sources!:Source[];

  @CreateDateColumn()
  createdAt!:Date;

  @Column({ nullable: true })
  websiteUrl?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  openingDate?: Date;

  @Column({ nullable: true })
  discoveredArea?: string;


}

//TypeORM
//Entity tablo
//PrimaryGeneratedColumn : primary key ve değeri otomatik üretilecek
// column tablodaki sütun
//CreateDateColumn kayıt oluşturulduğu tarihi otomatik kaydeder