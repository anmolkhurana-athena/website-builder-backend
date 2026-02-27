import InstitutionService from './institution.service.js';

class InstitutionController {
  constructor() {
    this.institutionService = new InstitutionService();
  }

  // Create institution
  createInstitution = async (req, res) => {
    try {
      const result = await this.institutionService.createInstitution(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error('Create institution error:', error);
      res.status(400).json({ error: error.message });
    }
  };

  // Get all institutions
  getAllInstitutions = async (req, res) => {
    try {
      const result = await this.institutionService.getAllInstitutions(req.query);
      res.status(200).json(result);
    } catch (error) {
      console.error('Get all institutions error:', error);
      res.status(500).json({ error: error.message });
    }
  };

  // Get institution by ID
  getInstitutionById = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.institutionService.getInstitutionById(id);
      res.status(200).json(result);
    } catch (error) {
      console.error('Get institution by ID error:', error);
      const statusCode = error.message === 'Institution not found' ? 404 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  };

  // Update institution
  updateInstitution = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.institutionService.updateInstitution(id, req.body);
      res.status(200).json(result);
    } catch (error) {
      console.error('Update institution error:', error);
      const statusCode = error.message === 'Institution not found' ? 404 : 400;
      res.status(statusCode).json({ error: error.message });
    }
  };

  // Approve institution
  approveInstitution = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.institutionService.approveInstitution(id);
      res.status(200).json(result);
    } catch (error) {
      console.error('Approve institution error:', error);
      const statusCode = error.message === 'Institution not found' ? 404 : 400;
      res.status(statusCode).json({ error: error.message });
    }
  };

  // Block institution
  blockInstitution = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.institutionService.blockInstitution(id);
      res.status(200).json(result);
    } catch (error) {
      console.error('Block institution error:', error);
      const statusCode = error.message === 'Institution not found' ? 404 : 400;
      res.status(statusCode).json({ error: error.message });
    }
  };

  // Delete institution
  deleteInstitution = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.institutionService.deleteInstitution(id);
      res.status(200).json(result);
    } catch (error) {
      console.error('Delete institution error:', error);
      const statusCode = error.message === 'Institution not found' ? 404 : 400;
      res.status(statusCode).json({ error: error.message });
    }
  };
}

export default InstitutionController;
