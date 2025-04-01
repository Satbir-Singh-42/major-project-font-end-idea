import { users, type User, type InsertUser, mediaUploads, type MediaUpload, type InsertMediaUpload, detectionModels, type DetectionModel, type InsertDetectionModel, analysisResults, type AnalysisResult, type InsertAnalysisResult, type ModelInfo, type AnalysisResponse } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations (from existing code)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Media operations
  getMediaUpload(id: number): Promise<MediaUpload | undefined>;
  getMediaUploadsByUser(userId?: number): Promise<MediaUpload[]>;
  createMediaUpload(upload: InsertMediaUpload): Promise<MediaUpload>;
  updateMediaStatus(id: number, status: string): Promise<MediaUpload | undefined>;

  // Model operations
  getDetectionModels(): Promise<DetectionModel[]>;
  getDetectionModel(id: number): Promise<DetectionModel | undefined>;
  createDetectionModel(model: InsertDetectionModel): Promise<DetectionModel>;

  // Analysis operations
  createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult>;
  getAnalysisResultsByMediaId(mediaId: number): Promise<AnalysisResult[]>;
  getAnalysisById(id: number): Promise<AnalysisResult | undefined>;
  getCompleteAnalysis(mediaId: number): Promise<AnalysisResponse | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private mediaUploads: Map<number, MediaUpload>;
  private detectionModels: Map<number, DetectionModel>;
  private analysisResults: Map<number, AnalysisResult>;
  currentUserId: number;
  currentMediaId: number;
  currentModelId: number;
  currentAnalysisId: number;

  constructor() {
    this.users = new Map();
    this.mediaUploads = new Map();
    this.detectionModels = new Map();
    this.analysisResults = new Map();
    this.currentUserId = 1;
    this.currentMediaId = 1;
    this.currentModelId = 1;
    this.currentAnalysisId = 1;

    // Initialize with default detection models
    this.initDefaultModels();
  }

  private initDefaultModels() {
    const defaultModels: InsertDetectionModel[] = [
      {
        name: "FaceForensics++",
        description: "Specialized in facial manipulation detection",
        type: "both",
        isActive: true,
      },
      {
        name: "DeepFake Detection Challenge",
        description: "Facebook's DFDC model for video analysis",
        type: "video",
        isActive: true,
      },
      {
        name: "CNN-LSTM",
        description: "Temporal inconsistency detection",
        type: "video",
        isActive: true,
      },
      {
        name: "EfficientNet-B4",
        description: "High-accuracy image classification",
        type: "image",
        isActive: true,
      },
    ];

    defaultModels.forEach((model) => this.createDetectionModel(model));
  }

  // User methods (from existing code)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Media methods
  async getMediaUpload(id: number): Promise<MediaUpload | undefined> {
    return this.mediaUploads.get(id);
  }

  async getMediaUploadsByUser(userId?: number): Promise<MediaUpload[]> {
    if (userId) {
      return Array.from(this.mediaUploads.values()).filter(
        (upload) => upload.userId === userId
      );
    }
    return Array.from(this.mediaUploads.values());
  }

  async createMediaUpload(upload: InsertMediaUpload): Promise<MediaUpload> {
    const id = this.currentMediaId++;
    const now = new Date();
    const mediaUpload: MediaUpload = { 
      ...upload, 
      id, 
      uploadedAt: now, 
      status: "pending" 
    };
    this.mediaUploads.set(id, mediaUpload);
    return mediaUpload;
  }

  async updateMediaStatus(id: number, status: string): Promise<MediaUpload | undefined> {
    const mediaUpload = await this.getMediaUpload(id);
    if (!mediaUpload) return undefined;
    
    const updatedUpload = { ...mediaUpload, status };
    this.mediaUploads.set(id, updatedUpload);
    return updatedUpload;
  }

  // Model methods
  async getDetectionModels(): Promise<DetectionModel[]> {
    return Array.from(this.detectionModels.values());
  }

  async getDetectionModel(id: number): Promise<DetectionModel | undefined> {
    return this.detectionModels.get(id);
  }

  async createDetectionModel(model: InsertDetectionModel): Promise<DetectionModel> {
    const id = this.currentModelId++;
    const detectionModel: DetectionModel = { ...model, id };
    this.detectionModels.set(id, detectionModel);
    return detectionModel;
  }

  // Analysis methods
  async createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult> {
    const id = this.currentAnalysisId++;
    const now = new Date();
    const analysisResult: AnalysisResult = { ...result, id, analyzedAt: now };
    this.analysisResults.set(id, analysisResult);
    return analysisResult;
  }

  async getAnalysisResultsByMediaId(mediaId: number): Promise<AnalysisResult[]> {
    return Array.from(this.analysisResults.values()).filter(
      (result) => result.mediaId === mediaId
    );
  }

  async getAnalysisById(id: number): Promise<AnalysisResult | undefined> {
    return this.analysisResults.get(id);
  }

  async getCompleteAnalysis(mediaId: number): Promise<AnalysisResponse | undefined> {
    const mediaUpload = await this.getMediaUpload(mediaId);
    if (!mediaUpload) return undefined;

    const analysisResults = await this.getAnalysisResultsByMediaId(mediaId);
    if (analysisResults.length === 0) return undefined;

    // Calculate overall confidence score (average of all model scores)
    const overallConfidence = Math.round(
      analysisResults.reduce((sum, result) => sum + result.confidenceScore, 0) / analysisResults.length
    );

    // Map analysis results to the response format
    const modelResults = await Promise.all(
      analysisResults.map(async (result) => {
        const model = await this.getDetectionModel(result.modelId);
        return {
          modelId: result.modelId,
          modelName: model?.name || "Unknown Model",
          modelDescription: model?.description || "",
          confidenceScore: result.confidenceScore,
          anomalies: (result.resultDetails.anomalies || []) as Array<{
            type: string;
            description: string;
            severity: "high" | "medium" | "low";
          }>,
          detailsData: result.resultDetails.detailsData || {},
        };
      })
    );

    // Generate manipulation types based on result details
    const manipulationTypes = Array.from(
      new Set(
        analysisResults.flatMap((result) => 
          (result.resultDetails.manipulationTypes || []) as Array<{ type: string; confidence: number }>
        )
      )
    ).sort((a, b) => b.confidence - a.confidence);

    return {
      mediaId,
      filename: mediaUpload.filename,
      filetype: mediaUpload.filetype,
      status: mediaUpload.status,
      overallConfidence,
      isDeepfake: overallConfidence > 60, // Consider as deepfake if confidence > 60%
      detectionTime: analysisResults[0].analyzedAt.toISOString(),
      manipulationTypes,
      modelResults,
      metadata: {
        fileInfo: {
          filename: mediaUpload.filename,
          filesize: mediaUpload.filesize,
          filetype: mediaUpload.filetype,
          duration: (analysisResults[0].resultDetails.metadata?.duration as string) || undefined,
          resolution: (analysisResults[0].resultDetails.metadata?.resolution as string) || undefined,
        },
        technicalAnalysis: (analysisResults[0].resultDetails.technicalAnalysis || {
          compressionLevel: "Medium",
          compressionSuspicious: false,
          encodingFormat: "Unknown",
          noisePattern: "Regular",
          noisePatternSuspicious: false,
          metadataConsistency: "Consistent",
          metadataModified: false,
        }) as {
          compressionLevel: string;
          compressionSuspicious: boolean;
          encodingFormat: string;
          noisePattern: string;
          noisePatternSuspicious: boolean;
          metadataConsistency: string;
          metadataModified: boolean;
        },
      },
    };
  }
}

export const storage = new MemStorage();
