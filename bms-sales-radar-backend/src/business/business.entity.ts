import{
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @Column()
  address!: string;

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

  @CreateDateColumn()
  createdAt!:Date;

}

//TypeORM
//Entity tablo
//PrimaryGeneratedColumn : primary key ve değeri otomatik üretilecek
// column tablodaki sütun
//CreateDateColumn kayıt oluşturulduğu tarihi otomatik kaydeder