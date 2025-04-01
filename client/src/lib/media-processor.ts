// This file would contain utility functions for processing media files
// For example, extracting metadata, generating thumbnails, etc.

/**
 * Extracts basic metadata from an image file
 */
export async function extractImageMetadata(file: File): Promise<{
  width: number;
  height: number;
  format: string;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve({
        width: img.width,
        height: img.height,
        format: file.type.split('/')[1].toUpperCase(),
      });
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Generates a thumbnail from an image or video file
 */
export async function generateThumbnail(
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 300
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type.startsWith('image/')) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Scale down if needed
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(img.src);
        resolve(canvas.toDataURL());
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
      img.src = URL.createObjectURL(file);
    } 
    else if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      
      video.onloadedmetadata = () => {
        // Seek to the first frame
        video.currentTime = 0;
        
        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          let width = video.videoWidth;
          let height = video.videoHeight;
          
          // Scale down if needed
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(video.src);
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(video, 0, 0, width, height);
          URL.revokeObjectURL(video.src);
          resolve(canvas.toDataURL());
        };
        
        // Start playing to trigger the seeked event
        video.play().catch(reject);
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video'));
      };
      
      video.src = URL.createObjectURL(file);
    } 
    else {
      reject(new Error('Unsupported file type'));
    }
  });
}

/**
 * Formats file size in a human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validates a media file based on type and size limits
 */
export function validateMediaFile(
  file: File,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime'],
  maxSizeBytes: number = 100 * 1024 * 1024 // 100MB default
): { valid: boolean; error?: string } {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid file type. Allowed types: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}` 
    };
  }
  
  // Check file size
  if (file.size > maxSizeBytes) {
    return { 
      valid: false, 
      error: `File too large. Maximum size: ${formatFileSize(maxSizeBytes)}` 
    };
  }
  
  return { valid: true };
}

/**
 * Validates a URL for media files
 */
export function validateMediaUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname.toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.mp4', '.mov'];
    
    if (!validExtensions.some(ext => path.endsWith(ext))) {
      return { 
        valid: false, 
        error: 'URL must point to a supported media file (JPG, PNG, MP4, MOV)' 
      };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
}
