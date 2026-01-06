import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class LocalStorageService {
  private uploadsDir: string;
  private avatarsDir: string;
  private baseUrl: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
    this.avatarsDir = path.join(process.cwd(), 'uploads', 'avatars');
    this.baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
      await fs.mkdir(this.avatarsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating uploads directory:', error);
    }
  }

  /**
   * Save a file to local storage
   */
  async saveFile(
    userId: string,
    file: Express.Multer.File,
    category: string = 'other'
  ): Promise<{ path: string; url: string; filename: string }> {
    // Create user directory if it doesn't exist
    const userDir = path.join(this.uploadsDir, userId, category);
    await fs.mkdir(userDir, { recursive: true });

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(userDir, uniqueFilename);

    // Save file
    await fs.writeFile(filePath, file.buffer);

    // Return relative path and full URL
    const relativePath = `documents/${userId}/${category}/${uniqueFilename}`;
    const url = `${this.baseUrl}/api/files/${relativePath}`;

    return {
      path: relativePath,
      url,
      filename: uniqueFilename,
    };
  }

  /**
   * Get file from storage
   */
  async getFile(relativePath: string): Promise<Buffer> {
    const fullPath = path.join(this.uploadsDir, relativePath.replace('documents/', ''));
    return await fs.readFile(fullPath);
  }

  /**
   * Delete file from storage
   */
  async deleteFile(relativePath: string): Promise<void> {
    const fullPath = path.join(this.uploadsDir, relativePath.replace('documents/', ''));
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      // File might not exist, log but don't throw
      console.warn('File not found for deletion:', fullPath);
    }
  }

  /**
   * Delete all files for a user (when user is deleted)
   */
  async deleteUserFiles(userId: string): Promise<void> {
    const userDir = path.join(this.uploadsDir, userId);
    try {
      await fs.rm(userDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Error deleting user files:', error);
    }
  }

  /**
   * Get file size
   */
  async getFileSize(relativePath: string): Promise<number> {
    const fullPath = path.join(this.uploadsDir, relativePath.replace('documents/', ''));
    const stats = await fs.stat(fullPath);
    return stats.size;
  }

  /**
   * Save avatar image
   */
  async saveAvatar(
    userId: string,
    file: Express.Multer.File
  ): Promise<{ path: string; url: string; filename: string }> {
    // Create user avatar directory if it doesn't exist
    const userDir = path.join(this.avatarsDir, userId);
    await fs.mkdir(userDir, { recursive: true });

    // Generate unique filename (always use jpg for avatars for consistency)
    const fileExtension = path.extname(file.originalname) || '.jpg';
    const uniqueFilename = `avatar${fileExtension}`;
    const filePath = path.join(userDir, uniqueFilename);

    // Save file
    await fs.writeFile(filePath, file.buffer);

    // Return relative path and full URL
    const relativePath = `avatars/${userId}/${uniqueFilename}`;
    const url = `${this.baseUrl}/api/files/${relativePath}`;

    return {
      path: relativePath,
      url,
      filename: uniqueFilename,
    };
  }

  /**
   * Get avatar file
   */
  async getAvatar(relativePath: string): Promise<Buffer> {
    const fullPath = path.join(this.avatarsDir, relativePath.replace('avatars/', ''));
    return await fs.readFile(fullPath);
  }

  /**
   * Delete avatar file
   */
  async deleteAvatar(relativePath: string): Promise<void> {
    const fullPath = path.join(this.avatarsDir, relativePath.replace('avatars/', ''));
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      console.warn('Avatar not found for deletion:', fullPath);
    }
  }
}

export default new LocalStorageService();

