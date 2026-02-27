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

    const text = `Hello ${userName},
    You requested to reset your password. Click the link below to reset it:
    ${resetUrl}
    This link will expire in 1 hour.
    If you didn't request this, please ignore this email.
    © ${new Date().getFullYear()} Website Builder. All rights reserved.`;

    return await this.sendEmail(to, subject, text);
  }

  async sendVerificationEmail(to, userName, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const subject = 'Email Verification';

    const text = `Hello ${userName},
    Thank you for registering. Please verify your email by clicking the link below:
    ${verificationUrl}
    This link will expire in 24 hours.
    If you didn't create an account, please ignore this email.
    © ${new Date().getFullYear()} Website Builder. All rights reserved.`;

    return await this.sendEmail(to, subject, text);
  }

  async sendInstitutionApprovalEmail(to, institutionName) {
    const subject = 'Institution Approved';

    const text = `Hello ${institutionName},
    Congratulations! Your institution has been approved.
    You can now access all features of the Website Builder platform.
    © ${new Date().getFullYear()} Website Builder. All rights reserved.`;

    return await this.sendEmail(to, subject, text);
  }

  async sendInstitutionBlockEmail(to, institutionName) {
    const subject = 'Institution Blocked';

    const text = `Hello ${institutionName},
    Your institution has been blocked. Please contact support for more information.
    © ${new Date().getFullYear()} Website Builder. All rights reserved.`;

    return await this.sendEmail(to, subject, text);
  }
}

export default new EmailService();