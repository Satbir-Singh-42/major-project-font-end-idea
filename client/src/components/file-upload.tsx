import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Link, FileType, Image, Film } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileUpload: (file: File, formData: FormData) => void;
  onUrlAnalysis: (url: string) => void;
  isLoading: boolean;
}

export default function FileUpload({ onFileUpload, onUrlAnalysis, isLoading }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload JPG, PNG, MP4, or MOV files only.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 100MB.",
        variant: "destructive",
      });
      return;
    }

    // Create FormData for upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Call the parent handler
    onFileUpload(file, formData);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMediaUrl(e.target.value);
  };

  const handleStartAnalysis = () => {
    // Validate URL
    if (!mediaUrl) {
      toast({
        title: "No URL Provided",
        description: "Please enter a media URL or upload a file.",
        variant: "destructive",
      });
      return;
    }

    try {
      const url = new URL(mediaUrl);
      const fileExtension = url.pathname.split('.').pop()?.toLowerCase();
      const validExtensions = ['jpg', 'jpeg', 'png', 'mp4', 'mov'];
      
      if (!fileExtension || !validExtensions.includes(fileExtension)) {
        toast({
          title: "Invalid URL",
          description: "URL must point to a JPG, PNG, MP4, or MOV file.",
          variant: "destructive",
        });
        return;
      }

      // Call the parent handler
      onUrlAnalysis(mediaUrl);
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-lg transition-all duration-300 hover:shadow-xl border-t-4 border-t-primary">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4 text-gradient">Upload Media for Analysis</h2>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-8 mb-6 cursor-pointer flex flex-col items-center justify-center transition-all duration-300 ${
            isDragging 
              ? 'border-primary bg-primary/10 scale-105 shadow-md' 
              : 'border-gray-300 hover:border-primary hover:bg-primary/5 hover:scale-[1.02]'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <div className="flex space-x-4 mb-3">
            <Image className="text-indigo-500 h-6 w-6" />
            <Film className="text-pink-500 h-6 w-6" />
            <FileType className="text-purple-500 h-6 w-6" />
          </div>
          <Upload className="text-primary mb-2 h-10 w-10" />
          <p className="text-gray-800 font-medium text-center mb-1">Drag and drop or click to upload</p>
          <p className="text-xs text-gray-500 text-center">Supports JPG, PNG, MP4, MOV (Max 100MB)</p>
          <input 
            type="file" 
            id="fileInput" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/jpeg,image/png,video/mp4,video/quicktime"
            onChange={handleFileInputChange}
          />
        </div>
        
        <div className="text-center mb-4 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-xs text-gray-500 uppercase">or analyze from URL</span>
          </div>
        </div>
        
        <div className="mb-4">
          <Input
            type="url"
            placeholder="Enter media URL (e.g., https://example.com/image.jpg)"
            className="w-full focus:ring-2 focus:ring-primary/50"
            value={mediaUrl}
            onChange={handleUrlChange}
          />
        </div>
        
        <div>
          <Button 
            className="w-full text-base font-medium hover:scale-[1.03] transition-all duration-300 shadow-md hover:shadow-lg" 
            onClick={handleStartAnalysis}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Processing...
              </div>
            ) : (
              'Start DeepFake Analysis'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
