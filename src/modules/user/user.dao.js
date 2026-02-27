import prismaClient from '../../config/prisma.js';

class UserDao {
  async findUserById(id, { include_password_hash } = {}) {
    return await prismaClient.user.findUnique({
      where: { id },
      omit: {
        password_hash: !include_password_hash
      }
    });
  }

  async findUserByEmail(email) {
    return await prismaClient.user.findUnique({
      where: { email },
    });
  }

  async listUsers(filters = {}) {
    const { page = 1, limit = 10, role, isApproved, isVerified, institution_id, search } = filters;

    const skip = (page - 1) * limit;

    const where = {};

    if (role) where.role = role;
    if (typeof isApproved === 'boolean') where.isApproved = isApproved;
    if (typeof isVerified === 'boolean') where.isVerified = isVerified;
    if (institution_id) where.institution_id = institution_id;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prismaClient.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prismaClient.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUser(userId, data) {
    return await prismaClient.user.update({
      where: { id: userId },
      data,
    });
  }

  async deleteUser(userId) {
    return await prismaClient.user.delete({
      where: { id: userId },
    });
  }

  async approveUser(userId) {
    return await prismaClient.user.update({
      where: { id: userId },
      data: { isApproved: true },
    });
  }

  async blockUser(userId, blocked = true) {
    return await prismaClient.user.update({
      where: { id: userId },
      data: { isApproved: !blocked }, // block/unblock by toggli
    });
  }
}

export default UserDao;
