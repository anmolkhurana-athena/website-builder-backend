import prismaClient from '../../config/prisma.js';

class InstitutionDao {
  // Find all institutions
  async findAllInstitutions({ status } = {}) {
    const where = {};

    if (status) {
      where.status = status;
    }

    return await prismaClient.institution.findMany({
      where,
      include: {
        _count: {
          select: {
            users: true,
            websites: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // Count institutions
  async countInstitutions({ status } = {}) {
    const where = {};

    if (status) {
      where.status = status;
    }

    return await prismaClient.institution.count({ where });
  }

  // Find institution by ID
  async findInstitutionById(id) {
    return await prismaClient.institution.findUnique({
      where: { id },
      include: {
        select: {
          users: true,
          websites: true,
        },
      },
    });
  }

  // Find institution by email
  async findInstitutionByEmail(email) {
    return await prismaClient.institution.findUnique({
      where: { email },
    });
  }

  // Create institution
  async createInstitution(institutionData) {
    return await prismaClient.institution.create({
      data: institutionData,
    });
  }

  // Update institution
  async updateInstitution(id, institutionData) {
    return await prismaClient.institution.update({
      where: { id },
      data: institutionData,
    });
  }

  // Delete institution
  async deleteInstitution(id) {
    return await prismaClient.institution.delete({
      where: { id },
    });
  }

  // Approve institution
  async approveInstitution(id) {
    return await prismaClient.institution.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
  }

  // Block institution
  async blockInstitution(id) {
    return await prismaClient.institution.update({
      where: { id },
      data: { status: 'BLOCKED' },
    });
  }
}

export default InstitutionDao;
