import { Request, Response, NextFunction } from 'express';
import profileService from '../services/profile.service';
import storageService from '../services/storage.service';
import authService from '../services/auth.service';
import { prisma } from '../config/database';

export class UserController {
  /**
   * Get user profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      // Get user from MySQL
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      // Get or create profile from MongoDB
      const mongoProfileId = user.mongoProfileId || user.id;
      const profile = await profileService.getOrCreateProfile(user.id, mongoProfileId);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const { bio, location, careerPath, phone } = req.body;

      const profile = await profileService.updateProfile(req.user.id, {
        bio,
        location,
        careerPath,
        phone,
      });

      res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update preferences
   */
  async updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const { preferences } = req.body;

      const profile = await profileService.updatePreferences(req.user.id, preferences);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Education
  async addEducation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      // Ensure req.body is an object
      const educationData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      
      const profile = await profileService.addEducation(req.user.id, educationData);

      res.status(201).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async updateEducation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      const profile = await profileService.updateEducation(req.user.id, id, req.body);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async deleteEducation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      const profile = await profileService.deleteEducation(req.user.id, id);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Experiences
  async addExperience(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      // Log incoming data for debugging
      console.log('Received experience data:', JSON.stringify(req.body, null, 2));
      console.log('Type of req.body:', typeof req.body);
      
      // Ensure req.body is an object
      let experienceData = req.body;
      if (typeof req.body === 'string') {
        try {
          experienceData = JSON.parse(req.body);
        } catch (e) {
          res.status(400).json({
            success: false,
            error: 'Invalid JSON format',
          });
          return;
        }
      }
      
      // Validate required fields
      if (!experienceData.title || !experienceData.company || !experienceData.period) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: title, company, period',
        });
        return;
      }
      
      const profile = await profileService.addExperience(req.user.id, experienceData);

      res.status(201).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      console.error('Error in addExperience controller:', error);
      next(error);
    }
  }

  async updateExperience(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      const profile = await profileService.updateExperience(req.user.id, id, req.body);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async deleteExperience(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      const profile = await profileService.deleteExperience(req.user.id, id);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Skills
  async addSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      // Ensure req.body is an object
      const skillData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      
      const profile = await profileService.addSkill(req.user.id, skillData);

      res.status(201).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async updateSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      const profile = await profileService.updateSkill(req.user.id, id, req.body);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async deleteSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      const profile = await profileService.deleteSkill(req.user.id, id);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Documents
  async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file provided',
        });
        return;
      }

      const category = req.body.category || 'other';

      // Save file
      const { path: filePath, url, filename } = await storageService.saveFile(
        req.user.id,
        req.file,
        category
      );

      // Add to profile
      const document = {
        name: req.file.originalname,
        type: req.file.originalname.split('.').pop()?.toLowerCase() || '',
        size: req.file.size,
        path: filePath,
        url,
        category,
        mimeType: req.file.mimetype,
      };

      const profile = await profileService.addDocument(req.user.id, document);

      res.status(201).json({
        success: true,
        data: {
          document: profile.documents?.find((d: any) => d.path === filePath),
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  async deleteDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;

      // Get document to get path
      const profile = await profileService.getProfile(req.user.id);
      const document = profile.documents?.find((d: any) => d.id === id);

      if (!document) {
        res.status(404).json({
          success: false,
          error: 'Document not found',
        });
        return;
      }

      // Delete file from storage
      await storageService.deleteFile(document.path);

      // Delete from profile
      const updatedProfile = await profileService.deleteDocument(req.user.id, id);

      res.json({
        success: true,
        data: updatedProfile,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Change password
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          error: 'Current password and new password are required',
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          error: 'New password must be at least 6 characters long',
        });
        return;
      }

      // Get user with password hash
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { passwordHash: true },
      });

      if (!user || !user.passwordHash) {
        res.status(400).json({
          success: false,
          error: 'User does not have a password set',
        });
        return;
      }

      // Verify current password
      const isPasswordValid = await authService.comparePassword(currentPassword, user.passwordHash);
      if (!isPasswordValid) {
        res.status(400).json({
          success: false,
          error: 'Current password is incorrect',
        });
        return;
      }

      // Hash new password
      const newPasswordHash = await authService.hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: req.user.id },
        data: { passwordHash: newPasswordHash },
      });

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file provided',
        });
        return;
      }

      // Validate it's an image
      if (!req.file.mimetype.startsWith('image/')) {
        res.status(400).json({
          success: false,
          error: 'File must be an image',
        });
        return;
      }

      // Delete old avatar if exists
      const currentUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { avatar: true },
      });

      if (currentUser?.avatar && currentUser.avatar.includes('/api/files/avatars/')) {
        // Extract path from URL
        const oldPath = currentUser.avatar.split('/api/files/')[1];
        try {
          await storageService.deleteAvatar(oldPath);
        } catch (error) {
          console.warn('Error deleting old avatar:', error);
        }
      }

      // Save new avatar
      const { path: filePath, url } = await storageService.saveAvatar(
        req.user.id,
        req.file
      );

      // Update user avatar in database
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { avatar: url },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({
        success: true,
        data: {
          avatar: url,
          user: updatedUser,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export default new UserController();

