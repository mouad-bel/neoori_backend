import { UserProfile } from '../models/profile.model';
import { v4 as uuidv4 } from 'uuid';

export class ProfileService {
  /**
   * Award credits and add activity
   */
  private async awardCredits(
    userId: string,
    credits: number,
    activityText: string,
    activityType: string = 'credits'
  ): Promise<void> {
    const rawProfile = await UserProfile.collection.findOne({ userId });
    if (!rawProfile) return;

    const currentCredits = rawProfile.credits || 0;
    const newCredits = currentCredits + credits;

    // Create activity
    const activity = {
      id: uuidv4(),
      text: activityText,
      time: new Date().toISOString(),
      type: activityType,
      createdAt: new Date(),
    };

    // Get existing activities
    const existingActivities = rawProfile.recentActivities || [];
    const updatedActivities = [activity, ...existingActivities].slice(0, 10); // Keep last 10

    // Update credits and activities
    await UserProfile.collection.updateOne(
      { userId },
      {
        $set: {
          credits: newCredits,
          recentActivities: updatedActivities,
          updatedAt: new Date(),
        },
      }
    );
  }

  /**
   * Check and award credits for completed tasks
   */
  async checkAndAwardCredits(userId: string): Promise<void> {
    const rawProfile = await UserProfile.collection.findOne({ userId });
    if (!rawProfile) return;

    const currentCredits = rawProfile.credits || 0;
    let creditsToAward = 0;
    const activities: any[] = [];

    // Check if user has documents (15 credits)
    const hasDocuments = rawProfile.documents && rawProfile.documents.length > 0;
    const documentsAwarded = rawProfile.recentActivities?.some(
      (a: any) => a.type === 'task' && a.text?.includes('document')
    ) || false;

    if (hasDocuments && !documentsAwarded) {
      creditsToAward += 15;
      activities.push({
        id: uuidv4(),
        text: 'Vous avez gagné 15 crédits pour avoir téléchargé un document',
        time: new Date().toISOString(),
        type: 'task',
        createdAt: new Date(),
      });
    }

    // Check if profile is complete (20 credits)
    const hasBio = !!rawProfile.bio;
    const hasLocation = !!(rawProfile.location?.city || rawProfile.location?.address);
    const hasEducation = rawProfile.education && rawProfile.education.length > 0;
    const hasExperiences = rawProfile.experiences && rawProfile.experiences.length > 0;
    const hasSkills = rawProfile.skills && rawProfile.skills.length > 0;
    const hasDocs = rawProfile.documents && rawProfile.documents.length > 0;

    const isProfileComplete = hasBio && hasLocation && hasEducation && hasExperiences && hasSkills && hasDocs;
    const profileCompleteAwarded = rawProfile.recentActivities?.some(
      (a: any) => a.type === 'task' && a.text?.includes('profil complet')
    ) || false;

    if (isProfileComplete && !profileCompleteAwarded) {
      creditsToAward += 20;
      activities.push({
        id: uuidv4(),
        text: 'Vous avez gagné 20 crédits pour avoir complété votre profil',
        time: new Date().toISOString(),
        type: 'task',
        createdAt: new Date(),
      });
    }

    // Check if user completed a game (15 credits per game)
    const completedGames = rawProfile.gameProgress?.filter((gp: any) => gp.completed) || [];
    const gameAwards = rawProfile.recentActivities?.filter(
      (a: any) => a.type === 'game' && a.text?.includes('test')
    ) || [];
    
    completedGames.forEach((game: any) => {
      const alreadyAwarded = gameAwards.some((a: any) => 
        a.text?.includes(game.gameId) || a.text?.includes(game.gameType)
      );
      if (!alreadyAwarded) {
        creditsToAward += 15;
        activities.push({
          id: uuidv4(),
          text: `Vous avez gagné 15 crédits pour avoir complété le test "${game.gameType || game.gameId}"`,
          time: new Date().toISOString(),
          type: 'game',
          createdAt: new Date(),
        });
      }
    });

    // Award credits if any
    if (creditsToAward > 0) {
      const newCredits = currentCredits + creditsToAward;
      const existingActivities = rawProfile.recentActivities || [];
      const updatedActivities = [...activities, ...existingActivities].slice(0, 10);

      await UserProfile.collection.updateOne(
        { userId },
        {
          $set: {
            credits: newCredits,
            recentActivities: updatedActivities,
            updatedAt: new Date(),
          },
        }
      );
    }
  }
  /**
   * Get or create user profile
   */
  async getOrCreateProfile(userId: string, mongoProfileId: string): Promise<any> {
    // Use native MongoDB driver to check if profile exists (bypasses Mongoose validation)
    const rawDoc = await UserProfile.collection.findOne({ userId });

    if (!rawDoc) {
      // Create new profile using Mongoose (only for creation)
      const profile = new UserProfile({
        _id: mongoProfileId,
        userId,
        preferences: {
          notifications: {
            email: true,
            push: true,
          },
          privacy: {
            publicProfile: true,
            showEmail: false,
          },
          theme: 'auto',
          language: 'fr',
        },
      });
      await profile.save();
      return profile.toObject();
    }

    // Convert MongoDB document to plain object format (bypass Mongoose schema validation)
    return {
      _id: rawDoc._id.toString(),
      userId: rawDoc.userId,
      experiences: rawDoc.experiences || [],
      education: rawDoc.education || [],
      skills: rawDoc.skills || [],
      documents: rawDoc.documents || [],
      bio: rawDoc.bio,
      location: rawDoc.location,
      careerPath: rawDoc.careerPath,
      phone: rawDoc.phone,
      credits: rawDoc.credits || 0,
      preferences: rawDoc.preferences || {
        notifications: { email: true, push: true },
        privacy: { publicProfile: true, showEmail: false },
        theme: 'auto',
        language: 'fr',
      },
      gameProgress: rawDoc.gameProgress || [],
      achievements: rawDoc.achievements || [],
      recentActivities: rawDoc.recentActivities || [],
      createdAt: rawDoc.createdAt,
      updatedAt: rawDoc.updatedAt,
    };
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<any> {
    // Use native MongoDB driver to bypass Mongoose schema validation
    const rawDoc = await UserProfile.collection.findOne({ userId });
    if (!rawDoc) {
      throw new Error('Profile not found');
    }

    // Convert MongoDB document to plain object format
    return {
      _id: rawDoc._id.toString(),
      userId: rawDoc.userId,
      experiences: rawDoc.experiences || [],
      education: rawDoc.education || [],
      skills: rawDoc.skills || [],
      documents: rawDoc.documents || [],
      bio: rawDoc.bio,
      location: rawDoc.location,
      careerPath: rawDoc.careerPath,
      phone: rawDoc.phone,
      credits: rawDoc.credits || 0,
      preferences: rawDoc.preferences || {
        notifications: { email: true, push: true },
        privacy: { publicProfile: true, showEmail: false },
        theme: 'auto',
        language: 'fr',
      },
      gameProgress: rawDoc.gameProgress || [],
      achievements: rawDoc.achievements || [],
      recentActivities: rawDoc.recentActivities || [],
      createdAt: rawDoc.createdAt,
      updatedAt: rawDoc.updatedAt,
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: Partial<Pick<any, 'bio' | 'location' | 'careerPath' | 'phone'>>
  ): Promise<any> {
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: data },
      { new: true, upsert: true }
    );
    return profile?.toObject();
  }

  /**
   * Update preferences
   */
  async updatePreferences(userId: string, preferences: any): Promise<any> {
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: { preferences } },
      { new: true, upsert: true }
    );
    return profile?.toObject();
  }

  // Education
  async addEducation(userId: string, education: any): Promise<any> {
    // Ensure education is an object, not a string
    const eduData = typeof education === 'string' ? JSON.parse(education) : education;
    
    const educationEntry = {
      id: uuidv4(),
      degree: eduData.degree || '',
      school: eduData.school || '',
      year: eduData.year || '',
      field: eduData.field || '',
      description: eduData.description || '',
      createdAt: new Date(),
    };

    // First, ensure the profile exists
    let profile = await UserProfile.findOne({ userId });
    
    if (!profile) {
      // Create new profile with proper structure
      profile = new UserProfile({
        _id: userId,
        userId,
        education: [educationEntry],
        preferences: {
          notifications: {
            email: true,
            push: true,
          },
          privacy: {
            publicProfile: true,
            showEmail: false,
          },
          theme: 'auto',
          language: 'fr',
        },
      });
      await profile.save();
    } else {
      // Profile exists, use $push to safely add to array (without upsert to avoid schema issues)
      profile = await UserProfile.findOneAndUpdate(
        { userId },
        { $push: { education: educationEntry } },
        { new: true }
      );
      
      if (!profile) {
        throw new Error('Failed to update profile');
      }
    }
    
    return profile.toObject();
  }

  async updateEducation(userId: string, educationId: string, education: any): Promise<any> {
    // Use native MongoDB driver to avoid Mongoose casting issues
    const rawProfile = await UserProfile.collection.findOne({ userId });
    if (!rawProfile) {
      throw new Error('Profile not found');
    }

    const educationIndex = rawProfile.education?.findIndex((e: any) => e.id === educationId);
    if (educationIndex === undefined || educationIndex === -1) {
      throw new Error('Education not found');
    }

    if (rawProfile.education && Array.isArray(rawProfile.education)) {
      // Update the education entry
      const updatedEducation = [...rawProfile.education];
      updatedEducation[educationIndex] = {
        ...updatedEducation[educationIndex],
        ...education,
      };

      // Use native MongoDB driver to update
      await UserProfile.collection.updateOne(
        { userId },
        { 
          $set: { 
            education: updatedEducation,
            updatedAt: new Date()
          } 
        }
      );

      // Fetch updated profile using native driver
      const updatedDoc = await UserProfile.collection.findOne({ userId });
      if (!updatedDoc) {
        throw new Error('Failed to fetch updated profile');
      }

      // Convert to plain object format
      return {
        _id: updatedDoc._id.toString(),
        userId: updatedDoc.userId,
        experiences: updatedDoc.experiences || [],
        education: updatedDoc.education || [],
        skills: updatedDoc.skills || [],
        documents: updatedDoc.documents || [],
        bio: updatedDoc.bio,
        location: updatedDoc.location,
        careerPath: updatedDoc.careerPath,
        phone: updatedDoc.phone,
        preferences: updatedDoc.preferences || {
          notifications: { email: true, push: true },
          privacy: { publicProfile: true, showEmail: false },
          theme: 'auto',
          language: 'fr',
        },
        gameProgress: updatedDoc.gameProgress || [],
        achievements: updatedDoc.achievements || [],
        recentActivities: updatedDoc.recentActivities || [],
        createdAt: updatedDoc.createdAt,
        updatedAt: updatedDoc.updatedAt,
      };
    }

    throw new Error('Education array not found');
  }

  async deleteEducation(userId: string, educationId: string): Promise<any> {
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $pull: { education: { id: educationId } } },
      { new: true }
    );
    return profile?.toObject();
  }

  // Experiences
  async addExperience(userId: string, experience: any): Promise<any> {
    try {
      // Ensure experience is an object, not a string
      let expData = experience;
      if (typeof experience === 'string') {
        try {
          expData = JSON.parse(experience);
        } catch (e) {
          throw new Error('Invalid experience data format');
        }
      }
      
      const experienceEntry = {
        id: uuidv4(),
        title: String(expData.title || ''),
        company: String(expData.company || ''),
        period: String(expData.period || ''),
        description: String(expData.description || ''),
        createdAt: new Date(),
      };

      // First, check if profile exists using native MongoDB driver to avoid Mongoose casting
      const rawProfile = await UserProfile.collection.findOne({ userId });
      
      let profile;
      
      if (!rawProfile) {
        // Create new profile with proper structure
        profile = new UserProfile({
          _id: userId,
          userId,
          experiences: [experienceEntry],
          preferences: {
            notifications: {
              email: true,
              push: true,
            },
            privacy: {
              publicProfile: true,
              showEmail: false,
            },
            theme: 'auto',
            language: 'fr',
          },
        });
        await profile.save();
      } else {
        // Profile exists - get existing experiences and fix structure if needed
        let existingExperiences: any[] = [];
        
        if (rawProfile.experiences && Array.isArray(rawProfile.experiences)) {
          // Filter out invalid entries (strings, null, etc.) and keep only valid objects
          existingExperiences = rawProfile.experiences.filter((exp: any) => 
            exp && typeof exp === 'object' && !Array.isArray(exp) && exp.id && exp.title
          );
        }
        
        // Add the new experience
        existingExperiences.push(experienceEntry);
        
        // Use MongoDB native updateOne to bypass Mongoose casting completely
        // The existing document has malformed data (strings instead of objects), so we must bypass Mongoose
        console.log('Saving experiences count:', existingExperiences.length);
        console.log('Experiences data to save:', JSON.stringify(existingExperiences, null, 2));
        
        const updateResult = await UserProfile.collection.updateOne(
          { userId },
          { 
            $set: { 
              experiences: existingExperiences,
              updatedAt: new Date()
            } 
          }
        );
        
        console.log('Update result:', {
          matchedCount: updateResult.matchedCount,
          modifiedCount: updateResult.modifiedCount,
          upsertedCount: updateResult.upsertedCount,
          acknowledged: updateResult.acknowledged
        });
        
        if (updateResult.matchedCount === 0) {
          throw new Error('Profile not found in database');
        }
        
        // Immediately verify what's in MongoDB after update
        const verifyDoc = await UserProfile.collection.findOne({ userId });
        console.log('MongoDB experiences immediately after update:', JSON.stringify(verifyDoc?.experiences, null, 2));
        console.log('MongoDB experiences count:', verifyDoc?.experiences?.length || 0);
        
        // Fetch the updated document using native MongoDB (bypass Mongoose casting)
        const updatedDoc = await UserProfile.collection.findOne({ userId });
        if (!updatedDoc) {
          throw new Error('Failed to fetch updated profile');
        }
        
        // Convert MongoDB document to plain object format expected by the API
        profile = {
          _id: updatedDoc._id.toString(),
          userId: updatedDoc.userId,
          experiences: updatedDoc.experiences || [],
          education: updatedDoc.education || [],
          skills: updatedDoc.skills || [],
          documents: updatedDoc.documents || [],
          bio: updatedDoc.bio,
          location: updatedDoc.location,
          careerPath: updatedDoc.careerPath,
          phone: updatedDoc.phone,
          preferences: updatedDoc.preferences,
          gameProgress: updatedDoc.gameProgress || [],
          achievements: updatedDoc.achievements || [],
          recentActivities: updatedDoc.recentActivities || [],
          createdAt: updatedDoc.createdAt,
          updatedAt: updatedDoc.updatedAt,
        };
        
        console.log('Final profile experiences count:', profile.experiences?.length || 0);
      }
      
      // Return as plain object (handle both Mongoose documents and plain objects)
      if (profile && typeof (profile as any).toObject === 'function') {
        return (profile as any).toObject();
      }
      return profile;
    } catch (error: any) {
      console.error('Error adding experience:', error);
      throw error;
    }
  }

  async updateExperience(userId: string, experienceId: string, experience: any): Promise<any> {
    // Use native MongoDB driver to avoid Mongoose casting issues
    const rawProfile = await UserProfile.collection.findOne({ userId });
    if (!rawProfile) {
      throw new Error('Profile not found');
    }

    const experienceIndex = rawProfile.experiences?.findIndex((e: any) => e.id === experienceId);
    if (experienceIndex === undefined || experienceIndex === -1) {
      throw new Error('Experience not found');
    }

    if (rawProfile.experiences && Array.isArray(rawProfile.experiences)) {
      // Update the experience entry
      const updatedExperiences = [...rawProfile.experiences];
      updatedExperiences[experienceIndex] = {
        ...updatedExperiences[experienceIndex],
        ...experience,
      };

      // Use native MongoDB driver to update
      await UserProfile.collection.updateOne(
        { userId },
        { 
          $set: { 
            experiences: updatedExperiences,
            updatedAt: new Date()
          } 
        }
      );

      // Fetch updated profile using native driver
      const updatedDoc = await UserProfile.collection.findOne({ userId });
      if (!updatedDoc) {
        throw new Error('Failed to fetch updated profile');
      }

      // Convert to plain object format
      return {
        _id: updatedDoc._id.toString(),
        userId: updatedDoc.userId,
        experiences: updatedDoc.experiences || [],
        education: updatedDoc.education || [],
        skills: updatedDoc.skills || [],
        documents: updatedDoc.documents || [],
        bio: updatedDoc.bio,
        location: updatedDoc.location,
        careerPath: updatedDoc.careerPath,
        phone: updatedDoc.phone,
        preferences: updatedDoc.preferences || {
          notifications: { email: true, push: true },
          privacy: { publicProfile: true, showEmail: false },
          theme: 'auto',
          language: 'fr',
        },
        gameProgress: updatedDoc.gameProgress || [],
        achievements: updatedDoc.achievements || [],
        recentActivities: updatedDoc.recentActivities || [],
        createdAt: updatedDoc.createdAt,
        updatedAt: updatedDoc.updatedAt,
      };
    }

    throw new Error('Experiences array not found');
  }

  async deleteExperience(userId: string, experienceId: string): Promise<any> {
    // Use native MongoDB driver to bypass Mongoose casting issues
    const updateResult = await UserProfile.collection.updateOne(
      { userId },
      { $pull: { experiences: { id: experienceId } } } as any
    );
    
    if (updateResult.matchedCount === 0) {
      throw new Error('Profile not found');
    }
    
    // Fetch the updated document using native MongoDB
    const updatedDoc = await UserProfile.collection.findOne({ userId });
    if (!updatedDoc) {
      throw new Error('Failed to fetch updated profile');
    }
    
    // Convert MongoDB document to plain object format
    return {
      _id: updatedDoc._id.toString(),
      userId: updatedDoc.userId,
      experiences: updatedDoc.experiences || [],
      education: updatedDoc.education || [],
      skills: updatedDoc.skills || [],
      documents: updatedDoc.documents || [],
      bio: updatedDoc.bio,
      location: updatedDoc.location,
      careerPath: updatedDoc.careerPath,
      phone: updatedDoc.phone,
      preferences: updatedDoc.preferences || {
        notifications: { email: true, push: true },
        privacy: { publicProfile: true, showEmail: false },
        theme: 'auto',
        language: 'fr',
      },
      gameProgress: updatedDoc.gameProgress || [],
      achievements: updatedDoc.achievements || [],
      recentActivities: updatedDoc.recentActivities || [],
      createdAt: updatedDoc.createdAt,
      updatedAt: updatedDoc.updatedAt,
    };
  }

  // Skills
  async addSkill(userId: string, skill: any): Promise<any> {
    // Ensure skill is an object, not a string
    const skillData = typeof skill === 'string' ? JSON.parse(skill) : skill;
    
    const skillEntry = {
      id: uuidv4(),
      name: skillData.name || '',
      level: skillData.level || 0,
      category: skillData.category || '',
      createdAt: new Date(),
    };

    // First, ensure the profile exists
    let profile = await UserProfile.findOne({ userId });
    
    if (!profile) {
      // Create new profile with proper structure
      profile = new UserProfile({
        _id: userId,
        userId,
        skills: [skillEntry],
        preferences: {
          notifications: {
            email: true,
            push: true,
          },
          privacy: {
            publicProfile: true,
            showEmail: false,
          },
          theme: 'auto',
          language: 'fr',
        },
      });
      await profile.save();
    } else {
      // Profile exists, use $push to safely add to array (without upsert to avoid schema issues)
      profile = await UserProfile.findOneAndUpdate(
        { userId },
        { $push: { skills: skillEntry } },
        { new: true }
      );
      
      if (!profile) {
        throw new Error('Failed to update profile');
      }
    }
    
    return profile.toObject();
  }

  async updateSkill(userId: string, skillId: string, skill: any): Promise<any> {
    // Use native MongoDB driver to avoid Mongoose casting issues
    const rawProfile = await UserProfile.collection.findOne({ userId });
    if (!rawProfile) {
      throw new Error('Profile not found');
    }

    const skillIndex = rawProfile.skills?.findIndex((s: any) => s.id === skillId);
    if (skillIndex === undefined || skillIndex === -1) {
      throw new Error('Skill not found');
    }

    if (rawProfile.skills && Array.isArray(rawProfile.skills)) {
      // Update the skill entry
      const updatedSkills = [...rawProfile.skills];
      updatedSkills[skillIndex] = {
        ...updatedSkills[skillIndex],
        ...skill,
      };

      // Use native MongoDB driver to update
      await UserProfile.collection.updateOne(
        { userId },
        { 
          $set: { 
            skills: updatedSkills,
            updatedAt: new Date()
          } 
        }
      );

      // Fetch updated profile using native driver
      const updatedDoc = await UserProfile.collection.findOne({ userId });
      if (!updatedDoc) {
        throw new Error('Failed to fetch updated profile');
      }

      // Convert to plain object format
      return {
        _id: updatedDoc._id.toString(),
        userId: updatedDoc.userId,
        experiences: updatedDoc.experiences || [],
        education: updatedDoc.education || [],
        skills: updatedDoc.skills || [],
        documents: updatedDoc.documents || [],
        bio: updatedDoc.bio,
        location: updatedDoc.location,
        careerPath: updatedDoc.careerPath,
        phone: updatedDoc.phone,
        preferences: updatedDoc.preferences || {
          notifications: { email: true, push: true },
          privacy: { publicProfile: true, showEmail: false },
          theme: 'auto',
          language: 'fr',
        },
        gameProgress: updatedDoc.gameProgress || [],
        achievements: updatedDoc.achievements || [],
        recentActivities: updatedDoc.recentActivities || [],
        createdAt: updatedDoc.createdAt,
        updatedAt: updatedDoc.updatedAt,
      };
    }

    throw new Error('Skills array not found');
  }

  async deleteSkill(userId: string, skillId: string): Promise<any> {
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $pull: { skills: { id: skillId } } },
      { new: true }
    );
    return profile?.toObject();
  }

  // Documents
  async addDocument(userId: string, document: any): Promise<any> {
    const documentEntry = {
      id: uuidv4(),
      ...document,
      uploadedAt: new Date(),
    };

    // First, check if profile exists using native MongoDB driver to avoid Mongoose casting
    const rawProfile = await UserProfile.collection.findOne({ userId });
    
    let profile;
    
    if (!rawProfile) {
      // Create new profile with proper structure
      profile = new UserProfile({
        _id: userId,
        userId,
        documents: [documentEntry],
        preferences: {
          notifications: {
            email: true,
            push: true,
          },
          privacy: {
            publicProfile: true,
            showEmail: false,
          },
          theme: 'auto',
          language: 'fr',
        },
      });
      await profile.save();
    } else {
      // Profile exists - get existing documents and fix structure if needed
      let existingDocuments: any[] = [];
      
      if (rawProfile.documents && Array.isArray(rawProfile.documents)) {
        // Filter out invalid entries (strings, null, etc.) and keep only valid objects
        existingDocuments = rawProfile.documents.filter((doc: any) => 
          doc && typeof doc === 'object' && !Array.isArray(doc) && doc.id && doc.name
        );
      }
      
      // Add the new document
      existingDocuments.push(documentEntry);
      
      // Convert dates to proper format for MongoDB
      const documentsToSave = existingDocuments.map(doc => ({
        ...doc,
        uploadedAt: doc.uploadedAt instanceof Date ? doc.uploadedAt : new Date(doc.uploadedAt)
      }));
      
      // Use MongoDB native updateOne to bypass Mongoose validation
      // This is necessary when existing documents have malformed schema structures
      const updateResult = await UserProfile.collection.updateOne(
        { userId },
        { 
          $set: { 
            documents: documentsToSave,
            updatedAt: new Date()
          } 
        }
      );
      
      if (updateResult.matchedCount === 0) {
        throw new Error('Profile not found in database');
      }
      
      // Check if this is the first document and award credits
      const wasFirstDocument = existingDocuments.length === 0;
      if (wasFirstDocument) {
        await this.awardCredits(
          userId,
          15,
          'Vous avez gagné 15 crédits pour avoir téléchargé un document',
          'task'
        );
      }

      // Fetch the updated profile using native driver to get raw data
      const updatedRaw = await UserProfile.collection.findOne({ userId });
      if (!updatedRaw) {
        throw new Error('Failed to fetch updated profile');
      }

      // Convert to plain object format
      profile = {
        _id: updatedRaw._id.toString(),
        userId: updatedRaw.userId,
        experiences: updatedRaw.experiences || [],
        education: updatedRaw.education || [],
        skills: updatedRaw.skills || [],
        documents: updatedRaw.documents || [],
        bio: updatedRaw.bio,
        location: updatedRaw.location,
        careerPath: updatedRaw.careerPath,
        phone: updatedRaw.phone,
        credits: updatedRaw.credits || 0,
        preferences: updatedRaw.preferences || {
          notifications: { email: true, push: true },
          privacy: { publicProfile: true, showEmail: false },
          theme: 'auto',
          language: 'fr',
        },
        gameProgress: updatedRaw.gameProgress || [],
        achievements: updatedRaw.achievements || [],
        recentActivities: updatedRaw.recentActivities || [],
        createdAt: updatedRaw.createdAt,
        updatedAt: updatedRaw.updatedAt,
      };
    }
    
    // Return the plain object (already converted from native MongoDB driver)
    return profile;
  }

  async deleteDocument(userId: string, documentId: string): Promise<any> {
    // Use native MongoDB driver to bypass Mongoose casting issues
    const rawProfile = await UserProfile.collection.findOne({ userId });
    if (!rawProfile) {
      throw new Error('Profile not found');
    }

    // Check if document exists in raw MongoDB data
    const documents = rawProfile.documents || [];
    const document = Array.isArray(documents) 
      ? documents.find((d: any) => d && typeof d === 'object' && d.id === documentId)
      : null;
    
    if (!document) {
      throw new Error('Document not found');
    }

    // Use native MongoDB driver to delete the document
    const updateResult = await UserProfile.collection.updateOne(
      { userId },
      { 
        $pull: { documents: { id: documentId } } as any,
        $set: { updatedAt: new Date() }
      }
    );

    if (updateResult.matchedCount === 0) {
      throw new Error('Profile not found');
    }

    // Fetch the updated profile using native driver
    const updatedRaw = await UserProfile.collection.findOne({ userId });
    if (!updatedRaw) {
      throw new Error('Failed to fetch updated profile');
    }

    // Convert to plain object format
    return {
      _id: updatedRaw._id.toString(),
      userId: updatedRaw.userId,
      experiences: updatedRaw.experiences || [],
      education: updatedRaw.education || [],
      skills: updatedRaw.skills || [],
      documents: updatedRaw.documents || [],
      bio: updatedRaw.bio,
      location: updatedRaw.location,
      careerPath: updatedRaw.careerPath,
      phone: updatedRaw.phone,
      credits: updatedRaw.credits || 0,
      preferences: updatedRaw.preferences || {
        notifications: { email: true, push: true },
        privacy: { publicProfile: true, showEmail: false },
        theme: 'auto',
        language: 'fr',
      },
      gameProgress: updatedRaw.gameProgress || [],
      achievements: updatedRaw.achievements || [],
      recentActivities: updatedRaw.recentActivities || [],
      createdAt: updatedRaw.createdAt,
      updatedAt: updatedRaw.updatedAt,
    };
  }
}

export default new ProfileService();

