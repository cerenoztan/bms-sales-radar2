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

  @Column()
  name!: string;

  @Column({nullable:true})
  instagramUrl?: string;

  @Column({ nullable: true })
  facebookUrl?: string;

  @Column({ nullable: true })
  linkedinUrl?: string;

  @Column({ nullable: true })
  jobPostingUrl?: string;

  @Column({ nullable: true })
  googleMapsUrl?: string;

  @Column({ nullable: true, unique: true })
  googlePlaceId?: string;

  @Column({ type: 'text', nullable: true })
  discoverySource?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'datetime', nullable: true })
  postingDate?: Date;

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

}

//TypeORM
//Entity tablo
//PrimaryGeneratedColumn : primary key ve değeri otomatik üretilecek
// column tablodaki sütun
//CreateDateColumn kayıt oluşturulduğu tarihi otomatik kaydeder
