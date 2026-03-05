import prismaClient from '../../config/prisma.js';

class AuthDao {
  // User operations
  async findUserByEmail(email, { include_password_hash } = {}) {
    return await prismaClient.user.findUnique({
      where: { email },
      omit: {
        password_hash: !include_password_hash
      }
    });
  }

  async findUserById(id) {
    return await prismaClient.user.findUnique({
      where: { id },
      omit: {
        password_hash: true
      }
    });
  }

  async createUser(userData) {
    return await prismaClient.user.create({
      data: userData,
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
      data: {
        password_hash,
        lastPasswordChangeAt: new Date()
      },
      omit: {
        password_hash: true
      }
    })
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
      include: { user: true },
      where: {
        token_hash: tokenHash,
        expiresAt: { gt: new Date() }, // Only find valid (non-expired) tokens
      }
    });
  }

  // Clean up expired email verification tokens
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
      include: { user: true },
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

  // Clean up expired password reset tokens
  async deleteExpiredPasswordResetTokens() {
    return await prismaClient.passwordResetToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }


  // Refresh token operations
  async createRefreshToken(tokenData) {
    return await prismaClient.refreshToken.create({
      data: tokenData,
    });
  }

  async findRefreshToken(tokenHash) {
    return await prismaClient.refreshToken.findFirst({
      include: { user: true },
      where: {
        token_hash: tokenHash,
        expiresAt: { gt: new Date() }, // Only find valid (non-expired) tokens
      }
    });
  }

  async revokeRefreshToken(tokenId) {
    return await prismaClient.refreshToken.update({
      where: { id: tokenId },
      data: { isRevoked: true },
    });
  }

  async revokeAllRefreshTokens(userId) {
    return await prismaClient.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  // Clean up expired refresh tokens
  async deleteExpiredRefreshTokens() {
    return await prismaClient.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }
}

export default AuthDao;
