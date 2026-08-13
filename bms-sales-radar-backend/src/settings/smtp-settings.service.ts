import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { Repository } from 'typeorm';

import { UpdateSmtpSettingsDto } from './dto/update-smtp-settings.dto';
import { SmtpSettings } from './smtp-settings.entity';

export interface RuntimeSmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromName: string;
}

@Injectable()
export class SmtpSettingsService {
  constructor(
    @InjectRepository(SmtpSettings)
    private readonly repository: Repository<SmtpSettings>,
    private readonly config: ConfigService,
  ) {}

  async getPublicSettings() {
    const settings = await this.findStored();
    if (!settings) {
      return {
        host: this.config.get<string>('SMTP_HOST') ?? '',
        port: Number(this.config.get<string>('SMTP_PORT') ?? 587),
        secure: Number(this.config.get<string>('SMTP_PORT') ?? 587) === 465,
        username: this.config.get<string>('SMTP_USER') ?? '',
        fromName: this.config.get<string>('MAIL_FROM_NAME') ?? 'BMS Sales Radar',
        hasPassword: Boolean(this.config.get<string>('SMTP_APP_PASSWORD')),
      };
    }

    return {
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      username: settings.username,
      fromName: settings.fromName,
      hasPassword: Boolean(
        settings.passwordEncrypted || this.config.get<string>('SMTP_APP_PASSWORD'),
      ),
    };
  }

  async update(dto: UpdateSmtpSettingsDto) {
    let settings = await this.findStored();
    settings ??= this.repository.create();
    settings.host = dto.host.trim();
    settings.port = 587;
    settings.secure = false;
    settings.username = dto.username.trim();
    settings.fromName = dto.fromName.trim();
    if (dto.password) settings.passwordEncrypted = this.encrypt(dto.password);
    if (!settings.passwordEncrypted && !this.config.get<string>('SMTP_APP_PASSWORD')) {
      throw new BadRequestException('SMTP parolası zorunludur.');
    }
    await this.repository.save(settings);
    return this.getPublicSettings();
  }

  async getRuntimeSettings(): Promise<RuntimeSmtpSettings | null> {
    const settings = await this.findStored();
    if (settings) {
      return {
        host: settings.host,
        port: settings.port,
        secure: settings.secure,
        username: settings.username,
        password: settings.passwordEncrypted
          ? this.decrypt(settings.passwordEncrypted)
          : (this.config.get<string>('SMTP_APP_PASSWORD') ?? ''),
        fromName: settings.fromName,
      };
    }

    const host = this.config.get<string>('SMTP_HOST');
    const username = this.config.get<string>('SMTP_USER');
    const password = this.config.get<string>('SMTP_APP_PASSWORD');
    if (!host || !username || !password) return null;
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 587);
    return {
      host,
      port,
      secure: port === 465,
      username,
      password,
      fromName: this.config.get<string>('MAIL_FROM_NAME') ?? 'BMS Sales Radar',
    };
  }

  private findStored() {
    return this.repository.findOne({ where: {} });
  }

  private encryptionKey(): Buffer {
    const secret = this.config.get<string>('SMTP_ENCRYPTION_KEY')
      ?? this.config.get<string>('JWT_SECRET')
      ?? 'bms-sales-radar-secret-key';
    return createHash('sha256').update(secret).digest();
  }

  private encrypt(value: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64')).join('.');
  }

  private decrypt(value: string): string {
    try {
      const [iv, tag, encrypted] = value.split('.').map((part) => Buffer.from(part, 'base64'));
      const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey(), iv);
      decipher.setAuthTag(tag);
      return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
    } catch {
      throw new BadRequestException('Kayıtlı SMTP parolası çözülemedi. Parolayı yeniden kaydedin.');
    }
  }
}
