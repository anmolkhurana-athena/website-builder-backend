export const generatePasswordResetEmailTemplate = (userName, resetUrl) => {
    return `Hello ${userName},
    You requested to reset your password. Click the link below to reset it:
    ${resetUrl}
    This link will expire in 1 hour.
    If you didn't request this, please ignore this email.
    © ${new Date().getFullYear()} Website Builder. All rights reserved.`
}

export const generateVerificationEmailTemplate = (userName, verificationUrl) => {
    return `Hello ${userName},
    Thank you for registering. Please verify your email by clicking the link below:
    ${verificationUrl}
    This link will expire in 24 hours.
    If you didn't create an account, please ignore this email.
    © ${new Date().getFullYear()} Website Builder. All rights reserved.`;
}