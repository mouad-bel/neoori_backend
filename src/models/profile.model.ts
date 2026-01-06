import mongoose, { Schema, Document } from 'mongoose';

// Interface for User Profile (MongoDB)
export interface IUserProfile extends Omit<Document, '_id'> {
  _id: string;
  userId: string;
  
  // Profile
  bio?: string;
  location?: {
    city?: string;
    country?: string;
    address?: string;
  };
  careerPath?: string;
  phone?: string;
  credits?: number;
  
  // Education
  education?: Array<{
    id: string;
    degree: string;
    school: string;
    year: string;
    field?: string;
    description?: string;
    createdAt: Date;
  }>;
  
  // Experiences
  experiences?: Array<{
    id: string;
    title: string;
    company: string;
    period: string;
    description?: string;
    location?: string;
    type?: string;
    createdAt: Date;
  }>;
  
  // Skills
  skills?: Array<{
    id: string;
    name: string;
    level: number;
    category?: string;
    createdAt: Date;
  }>;
  
  // Documents (references to local storage)
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    path: string;
    url: string;
    uploadedAt: Date;
    category?: string;
    mimeType?: string;
  }>;
  
  // Preferences
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
    };
    privacy: {
      publicProfile: boolean;
      showEmail: boolean;
    };
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
  };
  
  // Game Progress
  gameProgress?: Array<{
    gameId: string;
    gameType: string;
    currentQuestion?: number;
    totalQuestions?: number;
    answers?: Record<string, any>;
    gameData?: any;
    startedAt: Date;
    lastUpdatedAt: Date;
    completed: boolean;
    score?: number;
  }>;
  
  // Achievements
  achievements?: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: Date;
  }>;
  
  // Recent Activities
  recentActivities?: Array<{
    id: string;
    text: string;
    time: string;
    type: string;
    createdAt: Date;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, unique: true },
    
    bio: String,
    location: {
      city: String,
      country: String,
      address: String,
    },
    careerPath: String,
    phone: String,
    credits: { type: Number, default: 0 },
    
    education: [{
      id: { type: String, required: true },
      degree: { type: String, required: true },
      school: { type: String, required: true },
      year: { type: String, required: true },
      field: String,
      description: String,
      createdAt: { type: Date, default: Date.now },
    }],
    
    experiences: [{
      id: { type: String, required: true },
      title: { type: String, required: true },
      company: { type: String, required: true },
      period: { type: String, required: true },
      description: String,
      location: String,
      type: String,
      createdAt: { type: Date, default: Date.now },
    }],
    
    skills: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      level: { type: Number, required: true, min: 0, max: 100 },
      category: String,
      createdAt: { type: Date, default: Date.now },
    }],
    
    documents: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      type: String,
      size: Number,
      path: { type: String, required: true },
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
      category: String,
      mimeType: String,
    }],
    
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
      privacy: {
        publicProfile: { type: Boolean, default: true },
        showEmail: { type: Boolean, default: false },
      },
      theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
      language: { type: String, default: 'fr' },
    },
    
    gameProgress: [{
      gameId: String,
      gameType: String,
      currentQuestion: Number,
      totalQuestions: Number,
      answers: Schema.Types.Mixed,
      gameData: Schema.Types.Mixed,
      startedAt: Date,
      lastUpdatedAt: Date,
      completed: Boolean,
      score: Number,
    }],
    
    achievements: [{
      id: String,
      title: String,
      description: String,
      icon: String,
      unlockedAt: Date,
    }],
    
    recentActivities: [{
      id: String,
      text: String,
      time: String,
      type: String,
      createdAt: { type: Date, default: Date.now },
    }],
  },
  {
    timestamps: true,
    _id: false, // Use custom _id
  }
);

// Indexes for performance
// Note: userId already has an index from unique: true, so we don't need to add it again
UserProfileSchema.index({ 'gameProgress.gameId': 1 });
UserProfileSchema.index({ 'achievements.id': 1 });

export const UserProfile = mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);

