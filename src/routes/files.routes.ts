import { Router } from 'express';
import { Request, Response } from 'express';
import storageService from '../services/storage.service';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/files/documents/:userId/:category/:filename
 * Serve document files (protected route)
 */
router.get(
  '/documents/:userId/:category/:filename',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { userId, category, filename } = req.params;
      
      // Verify user has access (user can only access their own files)
      if (req.user?.id !== userId) {
        res.status(403).json({ 
          success: false,
          error: 'Access denied' 
        });
        return;
      }

      const relativePath = `documents/${userId}/${category}/${filename}`;
      const fileBuffer = await storageService.getFile(relativePath);
      
      // Determine content type
      const ext = filename.split('.').pop()?.toLowerCase();
      const contentType = getContentType(ext || '');
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.send(fileBuffer);
    } catch (error: any) {
      console.error('Error serving file:', error);
      res.status(404).json({ 
        success: false,
        error: 'File not found' 
      });
    }
  }
);

/**
 * GET /api/files/avatars/:userId/:filename
 * Serve avatar images (can be public or authenticated, depending on your needs)
 * For now, making it authenticated for consistency
 */
router.get(
  '/avatars/:userId/:filename',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { userId, filename } = req.params;
      
      // Allow users to view their own avatars or make it public for profile viewing
      // For now, allowing any authenticated user to view avatars
      
      const relativePath = `avatars/${userId}/${filename}`;
      const fileBuffer = await storageService.getAvatar(relativePath);
      
      // Determine content type
      const ext = filename.split('.').pop()?.toLowerCase();
      const contentType = getContentType(ext || '');
      
      // Cache avatar for 1 day
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(fileBuffer);
    } catch (error: any) {
      console.error('Error serving avatar:', error);
      res.status(404).json({ 
        success: false,
        error: 'Avatar not found' 
      });
    }
  }
);

function getContentType(ext: string): string {
  const contentTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    txt: 'text/plain',
  };
  return contentTypes[ext] || 'application/octet-stream';
}

export default router;

