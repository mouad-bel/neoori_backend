import { Router } from 'express';
import multer from 'multer';
import userController from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'text/plain',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  },
});

// Separate upload config for avatars (only images, smaller size limit)
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for avatars
  },
  fileFilter: (req, file, cb) => {
    // Only images allowed for avatars
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Avatar must be an image'));
    }
  },
});

// All routes require authentication
router.use(authenticateToken);

// Profile routes
router.get('/profile', userController.getProfile.bind(userController));
router.patch('/profile', userController.updateProfile.bind(userController));
router.patch('/profile/preferences', userController.updatePreferences.bind(userController));
router.post('/change-password', userController.changePassword.bind(userController));

// Avatar route
router.post('/profile/avatar', avatarUpload.single('avatar'), userController.uploadAvatar.bind(userController));

// Education routes
router.post('/profile/education', userController.addEducation.bind(userController));
router.patch('/profile/education/:id', userController.updateEducation.bind(userController));
router.delete('/profile/education/:id', userController.deleteEducation.bind(userController));

// Experience routes
router.post('/profile/experiences', userController.addExperience.bind(userController));
router.patch('/profile/experiences/:id', userController.updateExperience.bind(userController));
router.delete('/profile/experiences/:id', userController.deleteExperience.bind(userController));

// Skills routes
router.post('/profile/skills', userController.addSkill.bind(userController));
router.patch('/profile/skills/:id', userController.updateSkill.bind(userController));
router.delete('/profile/skills/:id', userController.deleteSkill.bind(userController));

// Documents routes
router.post('/profile/documents', upload.single('document'), userController.uploadDocument.bind(userController));
router.delete('/profile/documents/:id', userController.deleteDocument.bind(userController));

export default router;

