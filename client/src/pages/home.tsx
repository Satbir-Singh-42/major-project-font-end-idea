import { useState } from "react";
import { useLocation } from "wouter";
import FileUpload from "@/components/file-upload";
import ModelSelection from "@/components/model-selection";
import AnalysisSettings from "@/components/analysis-settings";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ModelInfo } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function Home() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedModels, setSelectedModels] = useState<ModelInfo[]>([]);
  const [sensitivity, setSensitivity] = useState<number>(7);
  const [options, setOptions] = useState({
    detailedReport: true,
    highlightAnomalies: true,
    showComparison: false
  });

  // Fetch available models
  const { data: models, isLoading: modelsLoading } = useQuery<ModelInfo[]>({
    queryKey: ['/api/models'],
  });

  // Handle file upload
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/upload", undefined, {
        method: "POST",
        body: formData,
        headers: {}, // Let the browser set the appropriate Content-Type with boundary
      });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Upload Successful",
        description: "Your media is being processed for analysis.",
        duration: 5000,
      });
      setLocation(`/analysis/${data.mediaId}`);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload media",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  // Handle URL analysis
  const urlAnalysisMutation = useMutation({
    mutationFn: async (url: string) => {
      const selectedModelIds = selectedModels.map(model => model.id);
      const response = await apiRequest("POST", "/api/analyze-url", {
        url,
        selectedModels: selectedModelIds
      });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Started",
        description: "Your media URL is being processed for analysis.",
        duration: 5000,
      });
      setLocation(`/analysis/${data.mediaId}`);
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze media URL",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  const handleFileUpload = (file: File, formData: FormData) => {
    // Add selected models to formData
    formData.append("selectedModels", JSON.stringify(selectedModels.map(model => model.id)));
    
    // Add analysis settings to formData
    formData.append("sensitivity", sensitivity.toString());
    formData.append("options", JSON.stringify(options));
    
    uploadMutation.mutate(formData);
  };

  const handleUrlAnalysis = (url: string) => {
    urlAnalysisMutation.mutate(url);
  };

  const handleModelSelectionChange = (models: ModelInfo[]) => {
    setSelectedModels(models);
  };

  const handleSensitivityChange = (value: number) => {
    setSensitivity(value);
  };

  const handleOptionChange = (name: string, value: boolean) => {
    setOptions(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero section */}
      <div className="text-center mb-12 bg-gradient-to-br from-purple-900 via-primary to-purple-700 text-white p-10 rounded-2xl shadow-xl animate-fade-in">
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Advanced DeepFake Detection Platform</h1>
        <p className="text-white/90 max-w-3xl mx-auto text-lg">
          Detect manipulated media with our AI-powered deepfake detection system. Upload images or videos 
          to analyze them across multiple machine learning models for comprehensive verification.
        </p>
        <div className="mt-6 inline-flex animate-pulse">
          <span className="inline-flex items-center rounded-md bg-indigo-400/10 px-3 py-1 text-sm font-medium text-indigo-200 ring-1 ring-inset ring-indigo-400/30 mr-2">AI Powered</span>
          <span className="inline-flex items-center rounded-md bg-purple-400/10 px-3 py-1 text-sm font-medium text-purple-200 ring-1 ring-inset ring-purple-400/30 mr-2">Multi-Model</span>
          <span className="inline-flex items-center rounded-md bg-pink-400/10 px-3 py-1 text-sm font-medium text-pink-200 ring-1 ring-inset ring-pink-400/30">Real-time Analysis</span>
        </div>
      </div>

      {/* Main content */}
      <div className="md:flex md:space-x-8">
        {/* Left panel */}
        <div className="md:w-1/3 space-y-6">
          <FileUpload 
            onFileUpload={handleFileUpload} 
            onUrlAnalysis={handleUrlAnalysis}
            isLoading={uploadMutation.isPending || urlAnalysisMutation.isPending}
          />
          
          <ModelSelection 
            availableModels={models || []}
            isLoading={modelsLoading}
            onChange={handleModelSelectionChange}
          />
          
          <AnalysisSettings 
            sensitivity={sensitivity}
            options={options}
            onSensitivityChange={handleSensitivityChange}
            onOptionChange={handleOptionChange}
          />
        </div>
        
        {/* Right panel - initial state with info */}
        <div className="md:w-2/3 space-y-6 mt-6 md:mt-0">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-8 h-full border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 flex items-center text-gradient">
              <span className="bg-primary/10 text-primary rounded-full p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </span>
              DeepFake Detection Platform
            </h2>
            
            <div className="space-y-8">
              <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-l-indigo-500">
                <h3 className="font-semibold text-lg mb-3 text-indigo-700">How It Works</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our platform uses multiple advanced AI models to analyze images and videos for signs of manipulation. 
                  By comparing patterns, inconsistencies, and artifacts, we can detect deepfakes with high confidence.
                </p>
              </div>
              
              <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-l-purple-500">
                <h3 className="font-semibold text-lg mb-3 text-purple-700">Detection Capabilities</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <li className="flex items-center bg-purple-50 p-2 rounded text-sm">
                    <span className="bg-purple-100 text-purple-600 p-1 rounded-full mr-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    Face swapping detection
                  </li>
                  <li className="flex items-center bg-purple-50 p-2 rounded text-sm">
                    <span className="bg-purple-100 text-purple-600 p-1 rounded-full mr-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    Temporal inconsistencies
                  </li>
                  <li className="flex items-center bg-purple-50 p-2 rounded text-sm">
                    <span className="bg-purple-100 text-purple-600 p-1 rounded-full mr-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    Audio-visual sync issues
                  </li>
                  <li className="flex items-center bg-purple-50 p-2 rounded text-sm">
                    <span className="bg-purple-100 text-purple-600 p-1 rounded-full mr-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    Compression anomalies
                  </li>
                  <li className="flex items-center bg-purple-50 p-2 rounded text-sm">
                    <span className="bg-purple-100 text-purple-600 p-1 rounded-full mr-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    Metadata analysis
                  </li>
                  <li className="flex items-center bg-purple-50 p-2 rounded text-sm">
                    <span className="bg-purple-100 text-purple-600 p-1 rounded-full mr-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    AI-generated patterns
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-l-pink-500">
                <h3 className="font-semibold text-lg mb-3 text-pink-700">Get Started</h3>
                <div className="flex items-start">
                  <div className="bg-pink-100 text-pink-600 p-1.5 rounded-full mt-0.5 mr-3">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Upload an image or video from your device or provide a URL. Select one or more detection models
                    and customize sensitivity settings. Our system will analyze the media and generate a comprehensive
                    report highlighting any signs of manipulation with confidence scores.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
