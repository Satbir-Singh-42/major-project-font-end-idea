import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { insertMediaUploadSchema } from "@shared/schema";
import path from "path";
import fs from "fs";
import { promises as fsPromises } from "fs";
import { randomUUID } from "crypto";
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, "../uploads");
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueId = randomUUID();
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueId}${ext}`);
    },
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "video/mp4",
      "video/quicktime",
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. Only JPG, PNG, MP4, and MOV files are allowed."));
    }
  },
});

// Function to simulate processing a media file
async function processMedia(mediaId: number, selectedModels: number[]): Promise<void> {
  // Update media status to processing
  await storage.updateMediaStatus(mediaId, "processing");
  
  const mediaUpload = await storage.getMediaUpload(mediaId);
  if (!mediaUpload) return;
  
  const isVideo = mediaUpload.filetype.startsWith("video/");
  
  // Simulate processing time based on file size and type
  const processingTime = isVideo 
    ? Math.min(5000, mediaUpload.filesize / 1000) 
    : Math.min(3000, mediaUpload.filesize / 2000);
  
  await new Promise(resolve => setTimeout(resolve, processingTime));
  
  // Get models to use for analysis
  const availableModels = await storage.getDetectionModels();
  const modelsToUse = selectedModels.length > 0 
    ? availableModels.filter(model => 
        selectedModels.includes(model.id) && 
        (model.type === "both" || (isVideo ? model.type === "video" : model.type === "image"))
      )
    : availableModels.filter(model => 
        model.isActive && 
        (model.type === "both" || (isVideo ? model.type === "video" : model.type === "image"))
      );
  
  // Generate analysis results for each model
  for (const model of modelsToUse) {
    // Simulate different confidence scores for different models
    let confidenceScore = Math.floor(Math.random() * (95 - 60) + 60);
    if (model.name.includes("FaceForensics")) confidenceScore = 92;
    if (model.name.includes("CNN-LSTM")) confidenceScore = 86;
    
    // Generate anomalies based on model type
    const anomalies = [];
    if (model.name.includes("FaceForensics")) {
      anomalies.push(
        { 
          type: "visual", 
          description: "Inconsistent facial texture patterns detected around eyes and mouth regions", 
          severity: "high" as const
        },
        { 
          type: "visual", 
          description: "Unnatural blending boundaries identified on facial periphery", 
          severity: "high" as const
        },
        { 
          type: "lighting", 
          description: "Lighting inconsistencies between facial features", 
          severity: "medium" as const
        }
      );
    } else if (model.name.includes("CNN-LSTM")) {
      anomalies.push(
        { 
          type: "temporal", 
          description: "Unnatural eye blink patterns detected at 00:12-00:15", 
          severity: "high" as const
        },
        { 
          type: "motion", 
          description: "Motion inconsistencies between face and body movements", 
          severity: "high" as const
        },
        { 
          type: "sync", 
          description: "Audio-visual synchronization issues at multiple timestamps", 
          severity: "medium" as const
        }
      );
    } else if (model.name.includes("EfficientNet")) {
      anomalies.push(
        { 
          type: "pattern", 
          description: "Unusual pixel patterns detected in background areas", 
          severity: "high" as const
        },
        { 
          type: "artifacts", 
          description: "Compression artifacts inconsistent with claimed source", 
          severity: "medium" as const
        }
      );
    } else {
      anomalies.push(
        { 
          type: "general", 
          description: "Multiple manipulation indicators detected", 
          severity: "high" as const
        }
      );
    }
    
    // Generate manipulation types
    const manipulationTypes = [
      { type: "Face Swap", confidence: 95 },
      { type: "Expression Manipulation", confidence: 82 },
      { type: "Voice Synthesis", confidence: 56 }
    ];
    
    // Create detailed result object
    const resultDetails = {
      anomalies,
      manipulationTypes,
      detailsData: {
        // Different data based on model type
        ...(model.name.includes("FaceForensics") ? {
          heatmapData: "heatmap_data_url_here",
          faceRegions: [
            { region: "eyes", confidence: 96 },
            { region: "mouth", confidence: 91 },
            { region: "skin", confidence: 84 }
          ]
        } : {}),
        ...(model.name.includes("CNN-LSTM") ? {
          timelineData: [
            { timestamp: "00:05", confidence: 76 },
            { timestamp: "00:12", confidence: 98 },
            { timestamp: "00:24", confidence: 85 }
          ]
        } : {})
      },
      metadata: {
        duration: isVideo ? "00:42" : undefined,
        resolution: "1920x1080"
      },
      technicalAnalysis: {
        compressionLevel: "High",
        compressionSuspicious: true,
        encodingFormat: isVideo ? "H.264" : "JPEG",
        noisePattern: "Irregular",
        noisePatternSuspicious: true,
        metadataConsistency: "Modified",
        metadataModified: true
      }
    };
    
    // Create analysis result
    await storage.createAnalysisResult({
      mediaId,
      modelId: model.id,
      confidenceScore,
      resultDetails
    });
  }
  
  // Update media status to completed
  await storage.updateMediaStatus(mediaId, "completed");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get available detection models
  app.get("/api/models", async (req: Request, res: Response) => {
    try {
      const models = await storage.getDetectionModels();
      res.json(models);
    } catch (error) {
      console.error("Error fetching models:", error);
      res.status(500).json({ message: "Failed to fetch detection models" });
    }
  });

  // Upload media file
  app.post("/api/upload", upload.single("file"), async (req: Request, res: Response) => {
    try {
      console.log("File upload request received with body:", req.body);
      
      if (!req.file) {
        console.log("No file found in the request");
        return res.status(400).json({ message: "No file provided" });
      }

      console.log("File received:", req.file.originalname, req.file.mimetype, req.file.size);
      const { filename, mimetype, size, path: filePath } = req.file;
      
      // Validate upload data
      const validateData = insertMediaUploadSchema.parse({
        filename: req.file.originalname,
        filesize: size,
        filetype: mimetype,
        userId: req.body.userId ? parseInt(req.body.userId) : undefined
      });
      
      // Create media upload in storage
      const mediaUpload = await storage.createMediaUpload(validateData);
      console.log("Media upload created in storage with ID:", mediaUpload.id);
      
      // Extract selected models
      let selectedModels: number[] = [];
      try {
        if (req.body.selectedModels) {
          console.log("Selected models data:", req.body.selectedModels);
          selectedModels = JSON.parse(req.body.selectedModels).map((id: string | number) => 
            typeof id === 'string' ? parseInt(id) : id
          );
          console.log("Parsed selected models:", selectedModels);
        } else {
          // If no models selected, use all available models
          const allModels = await storage.getDetectionModels();
          selectedModels = allModels.map(model => model.id);
          console.log("No models specified, using all available models:", selectedModels);
        }
      } catch (parseError) {
        console.error("Error parsing selected models:", parseError);
        // Default to using model IDs 1 and 2 if parsing fails
        selectedModels = [1, 2];
        console.log("Falling back to default models:", selectedModels);
      }
      
      // Process media asynchronously
      processMedia(mediaUpload.id, selectedModels).catch(err => {
        console.error("Error processing media:", err);
        storage.updateMediaStatus(mediaUpload.id, "failed");
      });
      
      res.status(201).json({ 
        message: "Upload successful, processing started", 
        mediaId: mediaUpload.id 
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      
      // If there was a validation error
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid upload data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Get analysis status
  app.get("/api/analysis/:mediaId/status", async (req: Request, res: Response) => {
    try {
      const mediaId = parseInt(req.params.mediaId);
      if (isNaN(mediaId)) {
        return res.status(400).json({ message: "Invalid media ID" });
      }
      
      const mediaUpload = await storage.getMediaUpload(mediaId);
      if (!mediaUpload) {
        return res.status(404).json({ message: "Media not found" });
      }
      
      res.json({ status: mediaUpload.status });
    } catch (error) {
      console.error("Error fetching analysis status:", error);
      res.status(500).json({ message: "Failed to fetch analysis status" });
    }
  });

  // Get analysis results
  app.get("/api/analysis/:mediaId", async (req: Request, res: Response) => {
    try {
      const mediaId = parseInt(req.params.mediaId);
      if (isNaN(mediaId)) {
        return res.status(400).json({ message: "Invalid media ID" });
      }
      
      const analysis = await storage.getCompleteAnalysis(mediaId);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      res.status(500).json({ message: "Failed to fetch analysis" });
    }
  });

  // URL-based analysis
  app.post("/api/analyze-url", async (req: Request, res: Response) => {
    try {
      const { url, selectedModels } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "No URL provided" });
      }
      
      // Validate URL format
      if (!url.match(/^https?:\/\/.+\.(jpg|jpeg|png|mp4|mov)$/i)) {
        return res.status(400).json({ message: "Invalid URL format or unsupported file type" });
      }
      
      // Extract filename from URL
      const urlObj = new URL(url);
      const filename = path.basename(urlObj.pathname);
      const fileExtension = path.extname(filename).toLowerCase();
      
      // Determine file type based on extension
      let filetype;
      if (['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
        filetype = `image/${fileExtension.substring(1)}`;
      } else if (fileExtension === '.mp4') {
        filetype = 'video/mp4';
      } else if (fileExtension === '.mov') {
        filetype = 'video/quicktime';
      } else {
        return res.status(400).json({ message: "Unsupported file type" });
      }
      
      // Create media upload record
      const mediaUpload = await storage.createMediaUpload({
        filename,
        filesize: 0, // Size unknown for URL-based files
        filetype,
        userId: undefined
      });
      
      // Parse selected models
      const modelIds = selectedModels ? 
        selectedModels.map((id: string | number) => typeof id === 'string' ? parseInt(id) : id) : 
        [];
      
      // Process media asynchronously
      processMedia(mediaUpload.id, modelIds).catch(err => {
        console.error("Error processing media from URL:", err);
        storage.updateMediaStatus(mediaUpload.id, "failed");
      });
      
      res.status(201).json({ 
        message: "URL analysis started", 
        mediaId: mediaUpload.id 
      });
    } catch (error) {
      console.error("Error analyzing URL:", error);
      res.status(500).json({ message: "Failed to analyze URL" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
