import {
  Column,
  Entity,
  //ManyToOne :Many records in one table can be associated 
  // with one record in another table.
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Business } from '../business/business.entity';
//database design and excel design will be different !!!

//Entity creates a database table
@Entity('sources')
export class Source{
    @PrimaryGeneratedColumn()
    id!:number;

    @Column()
    name!:string;
    @Column({ nullable: true })
    externalId?:string;
 
    @Column()
    url!:string;


    // the relationship will be with Business entity
    //at Business entity sources represent the relationship
    @ManyToOne(() => Business,(business)=> business.sources,{
        onDelete:'CASCADE',
    })
    business!:Business;

}

//createdAt eklemeli miyim ?

//Sources -> Business many to one
//Business-> Sources one to many
//Source[] a list vs. Business only one object
//ManyToOne creates a businessID column for the database
//CASCADE : when the business gets deleted, the orphan records/sources of that business
// gets deleted from the database automatically.