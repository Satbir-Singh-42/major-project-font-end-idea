import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (from existing code)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Media Upload schema
export const mediaUploads = pgTable("media_uploads", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  filesize: integer("filesize").notNull(),
  filetype: text("filetype").notNull(),
  userId: integer("user_id"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
});

export const insertMediaUploadSchema = createInsertSchema(mediaUploads).omit({
  id: true,
  uploadedAt: true,
  status: true,
});

export type InsertMediaUpload = z.infer<typeof insertMediaUploadSchema>;
export type MediaUpload = typeof mediaUploads.$inferSelect;

// Detection Models schema
export const detectionModels = pgTable("detection_models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // image, video, or both
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertDetectionModelSchema = createInsertSchema(detectionModels).omit({
  id: true,
});

export type InsertDetectionModel = z.infer<typeof insertDetectionModelSchema>;
export type DetectionModel = typeof detectionModels.$inferSelect;

// Analysis Results schema
export const analysisResults = pgTable("analysis_results", {
  id: serial("id").primaryKey(),
  mediaId: integer("media_id").notNull(),
  modelId: integer("model_id").notNull(),
  confidenceScore: integer("confidence_score").notNull(), // 0-100
  resultDetails: jsonb("result_details").notNull(), // JSON with detailed analysis
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
});

export const insertAnalysisResultSchema = createInsertSchema(analysisResults).omit({
  id: true,
  analyzedAt: true,
});

export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;
export type AnalysisResult = typeof analysisResults.$inferSelect;

// Simplified API response types for frontend
export type ModelInfo = {
  id: number;
  name: string;
  description: string;
  type: string;
  isActive: boolean;
  isSelected?: boolean;
};

export type AnalysisResponse = {
  mediaId: number;
  filename: string;
  filetype: string;
  status: string;
  overallConfidence: number;
  isDeepfake: boolean;
  detectionTime: string;
  manipulationTypes: Array<{
    type: string;
    confidence: number;
  }>;
  modelResults: Array<{
    modelId: number;
    modelName: string;
    modelDescription: string;
    confidenceScore: number;
    anomalies: Array<{
      type: string;
      description: string;
      severity: "high" | "medium" | "low";
    }>;
    detailsData: any;
  }>;
  metadata: {
    fileInfo: {
      filename: string;
      filesize: number;
      filetype: string;
      duration?: string;
      resolution?: string;
    };
    technicalAnalysis: {
      compressionLevel: string;
      compressionSuspicious: boolean;
      encodingFormat: string;
      noisePattern: string;
      noisePatternSuspicious: boolean;
      metadataConsistency: string;
      metadataModified: boolean;
    };
  };
};
