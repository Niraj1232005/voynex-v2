import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const data = await this.resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to,
        subject,
        html,
      });

      return data;
    } catch (error) {
      console.error('Email send error:', error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}