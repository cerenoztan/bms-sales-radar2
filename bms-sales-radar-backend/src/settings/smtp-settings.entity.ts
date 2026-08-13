import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('smtp_settings')
export class SmtpSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  host: string;

  @Column({ default: 587 })
  port: number;

  @Column({ default: false })
  secure: boolean;

  @Column({ default: '' })
  username: string;

  @Column({ default: '' })
  passwordEncrypted: string;

  @Column({ default: 'BMS Sales Radar' })
  fromName: string;
}
