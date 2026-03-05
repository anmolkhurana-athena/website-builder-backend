import {
  generatePasswordResetEmailTemplate,
  generateVerificationEmailTemplate
} from "../builders/email-template.builder.js";

class EmailService {
  constructor() {
  }

  async sendEmail(to, subject, text) {
    // Simulate email sending
    console.log(`Email sent to ${to} with subject "${subject}" and text: ${text}`);
    return true;
  }

  async sendPasswordResetEmail(to, userName, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';

    const text = generatePasswordResetEmailTemplate(userName, resetUrl);

    return await this.sendEmail(to, subject, text);
  }

  async sendVerificationEmail(to, userName, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const subject = 'Email Verification';

    const text = generateVerificationEmailTemplate(userName, verificationUrl);

    return await this.sendEmail(to, subject, text);
  }
}

export default new EmailService();