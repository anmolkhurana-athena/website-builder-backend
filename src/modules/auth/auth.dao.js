import prismaClient from '../../config/prisma.js';

class AuthDao {
  // User operations
  async findUserByEmail(email, { include_password_hash } = {}) {
    return await prismaClient.user.findUnique({
      where: { email },
      include: {
        institution: true,
      },
      omit: {
        password_hash: !include_password_hash
      }
    });
  }

  async findUserById(id) {
    return await prismaClient.user.findUnique({
      where: { id },
      include: {
        institution: true,
      },
      omit: {
        password_hash: true
      }
    });
  }

  async createUser(userData) {
    return await prismaClient.user.create({
      data: userData,
      include: {
        institution: true,
      },
      omit: {
        password_hash: true
      }
    });
  }

  async updateUser(userId, userData) {
    return await prismaClient.user.update({
      where: { id: userId },
      data: userData,
      omit: {
        password_hash: true
      }
    });
  }

  async updateUserPassword(userId, password_hash) {
    return await prismaClient.user.update({
      where: { id: userId },
      data: { password_hash },
      omit: {
        password_hash: true
      }
    })
  }

  // Institution operations
  async findInstitutionByEmail(email) {
    return await prismaClient.institution.findUnique({
      where: { email },
    });
  }

  async createInstitution(institutionData) {
    return await prismaClient.institution.create({
      data: institutionData,
    });
  }

  // Email verification token operations
  async createEmailVerificationToken(tokenData) {
    return await prismaClient.emailVerificationToken.create({
      data: tokenData,
    });
  }

  async findEmailVerificationToken(tokenHash) {
    // find a valid (non-expired) verification token by its hash
    return await prismaClient.emailVerificationToken.findFirst({
      where: {
        token_hash: tokenHash,
        expiresAt: { gt: new Date() }, // Only find valid (non-expired) tokens
      }
    });
  }

  async deleteEmailVerificationToken(tokenId) {
    return await prismaClient.emailVerificationToken.delete({
      where: { id: tokenId },
    });
  }

  async deleteExpiredEmailVerificationTokens() {
    return await prismaClient.emailVerificationToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      },
    });
  }

  // Password reset token operations
  async createPasswordResetToken(tokenData) {
    return await prismaClient.passwordResetToken.create({
      data: tokenData,
    });
  }

  async findPasswordResetToken(tokenHash) {
    // find a valid (non-expired, non-used) reset token by its hash
    return await prismaClient.passwordResetToken.findFirst({
      where: {
        token_hash: tokenHash,
        expiresAt: { gt: new Date() }, // Only find valid (non-expired) tokens
        isUsed: false, // Only find tokens that haven't been used yet
      }
    });
  }

  async usePasswordResetToken(tokenId) {
    return await prismaClient.passwordResetToken.update({
      where: { id: tokenId },
      data: { isUsed: true },
    });
  }

  async deleteExpiredPasswordResetTokens() {
    return await prismaClient.passwordResetToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }
}

export default AuthDao;
