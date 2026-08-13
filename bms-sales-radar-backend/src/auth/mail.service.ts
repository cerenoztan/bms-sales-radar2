import { Injectable, InternalServerErrorException } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { SmtpSettingsService } from '../settings/smtp-settings.service';

@Injectable()
export class MailService {
  constructor(
    private readonly smtpSettings: SmtpSettingsService,
  ) {}

  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    const settings = await this.smtpSettings.getRuntimeSettings();

    if (!settings) {
      throw new InternalServerErrorException(
        'E-posta servisi yapılandırılmamış.',
      );
    }

    const transporter = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: { user: settings.username, pass: settings.password },
    });

    await transporter.sendMail({
      from: `"${settings.fromName.replace(/["\r\n]/g, '')}" <${settings.username}>`,
      to,
      subject: 'Şifre sıfırlama bağlantınız',
      text:
        `Şifrenizi yenilemek için aşağıdaki bağlantıyı açın. ` +
        `Bağlantı 15 dakika geçerlidir:\n\n${resetUrl}\n\n` +
        `Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.`,
      html:
        `<p>Şifrenizi yenilemek için aşağıdaki bağlantıyı açın.</p>` +
        `<p><a href="${resetUrl}">Şifremi yenile</a></p>` +
        `<p>Bağlantı 15 dakika geçerlidir. Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>`,
    });
  }
}
