import InstitutionDao from './institution.dao.js';
import emailService from '../../services/email.service.js';

class InstitutionService {
  constructor() {
    this.institutionDao = new InstitutionDao();
  }

  // Create a new institution
  async createInstitution(data) {
    const { name, email } = data;

    // Check if institution with email already exists
    const existingInstitution = await this.institutionDao.findInstitutionByEmail(email);
    if (existingInstitution) {
      throw new Error('Institution with this email already exists');
    }

    // Create institution
    const institution = await this.institutionDao.createInstitution({
      name, email
    });

    return {
      message: 'Institution created successfully',
      institution,
    };
  }

  // Get all institutions
  async getAllInstitutions(query = {}) {
    const { status } = query;
    // const skip = (page - 1) * limit;
    // const take = parseInt(limit);

    const filters = {};
    if (status) {
      filters.status = status;
    }

    const [institutions, total] = await Promise.all([
      this.institutionDao.findAllInstitutions(filters),
      this.institutionDao.countInstitutions(filters),
    ]);

    return {
      institutions,
      total,
    };
  }

  // Get institution by ID
  async getInstitutionById(id) {
    const institution = await this.institutionDao.findInstitutionById(id);

    if (!institution) {
      throw new Error('Institution not found');
    }
    
    return { institution };
  }

  // Update institution
  async updateInstitution(id, data) {
    const { name } = data;

    // Check if institution exists
    const existingInstitution = await this.institutionDao.findInstitutionById(id);
    if (!existingInstitution) {
      throw new Error('Institution not found');
    }

    // If email is being updated, check if new email is already taken
    if (email && email !== existingInstitution.email) {
      const institutionWithEmail = await this.institutionDao.findInstitutionByEmail(email);
      if (institutionWithEmail) {
        throw new Error('Institution with this email already exists');
      }
    }

    // Update institution
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const institution = await this.institutionDao.updateInstitution(id, updateData);

    if(email && email !== existingInstitution.email) {
      // Send email update notification
      try {
        await emailService.sendInstitutionEmailUpdateNotification(
          institution.email,
          institution.name
        );
      }
      catch (emailError) {
        console.error('Failed to send email update notification:', emailError);
        // Don't throw error if email fails, institution is already updated
      }
    }

    return {
      message: 'Institution updated successfully',
      institution,
    };
  }

  // Approve institution
  async approveInstitution(id) {
    // Check if institution exists
    const existingInstitution = await this.institutionDao.findInstitutionById(id);
    if (!existingInstitution) {
      throw new Error('Institution not found');
    }

    // Check current status
    if (existingInstitution.status === 'APPROVED') {
      throw new Error('Institution is already approved');
    }

    // Approve institution
    const institution = await this.institutionDao.approveInstitution(id);

    // Send approval notification email
    try {
      await emailService.sendInstitutionApprovalEmail(
        institution.email,
        institution.name
      );
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't throw error if email fails, institution is already approved
    }

    return {
      message: 'Institution approved successfully',
      institution,
    };
  }

  // Block institution
  async blockInstitution(id) {
    // Check if institution exists
    const existingInstitution = await this.institutionDao.findInstitutionById(id);
    if (!existingInstitution) {
      throw new Error('Institution not found');
    }

    // Check current status
    if (existingInstitution.status === 'BLOCKED') {
      throw new Error('Institution is already blocked');
    }

    // Block institution
    const institution = await this.institutionDao.blockInstitution(id);

    // Send block notification email
    try {
      await emailService.sendInstitutionBlockEmail(
        institution.email,
        institution.name
      );
    } catch (emailError) {
      console.error('Failed to send block email:', emailError);
      // Don't throw error if email fails, institution is already blocked
    }

    return {
      message: 'Institution blocked successfully',
      institution,
    };
  }

  // Delete institution
  async deleteInstitution(id) {
    // Check if institution exists
    const existingInstitution = await this.institutionDao.findInstitutionById(id);
    if (!existingInstitution) {
      throw new Error('Institution not found');
    }

    // Check if institution has users or websites
    if (existingInstitution._count.users > 0) {
      throw new Error('Cannot delete institution with existing users');
    }

    if (existingInstitution._count.websites > 0) {
      throw new Error('Cannot delete institution with existing websites');
    }

    // Delete institution
    await this.institutionDao.deleteInstitution(id);

    return {
      message: 'Institution deleted successfully',
    };
  }
}

export default InstitutionService;
