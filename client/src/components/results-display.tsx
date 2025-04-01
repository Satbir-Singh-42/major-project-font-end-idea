import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Download, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ConfidenceMeter from '@/components/ui/confidence-meter';
import ProgressIndicator from '@/components/ui/progress-indicator';
import { AnalysisResponse } from '@shared/schema';
import { Badge } from '@/components/ui/badge';

interface ResultsDisplayProps {
  isAnalysisComplete: boolean;
  isAnalysisInProgress: boolean;
  analysisData?: AnalysisResponse;
  isLoading: boolean;
}

export default function ResultsDisplay({ 
  isAnalysisComplete, 
  isAnalysisInProgress, 
  analysisData, 
  isLoading 
}: ResultsDisplayProps) {
  const [expandedModels, setExpandedModels] = useState<number[]>([]);

  const toggleModelDetails = (modelId: number) => {
    setExpandedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId) 
        : [...prev, modelId]
    );
  };

  const handleExportResults = () => {
    if (!analysisData) return;
    
    // Create a JSON download
    const jsonData = JSON.stringify(analysisData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `deepfake-analysis-${analysisData.mediaId}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <Card className="shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">Analysis Results</h2>
            <Skeleton className="h-8 w-24" />
          </div>
          
          <div className="space-y-8">
            <div>
              <Skeleton className="h-64 w-full rounded-lg mb-6" />
              <div className="flex flex-col md:flex-row md:space-x-6">
                <Skeleton className="h-48 w-full md:w-1/2 rounded-lg mb-4 md:mb-0" />
                <Skeleton className="h-48 w-full md:w-1/2 rounded-lg" />
              </div>
            </div>
            
            <div>
              <Skeleton className="h-12 w-full rounded-lg mb-4" />
              <Skeleton className="h-12 w-full rounded-lg mb-4" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow transition-all duration-300 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Analysis Results</h2>
          {isAnalysisComplete && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:text-primary/80 flex items-center" 
              onClick={handleExportResults}
            >
              <Download className="mr-1 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
        
        {/* Analysis in progress view */}
        {isAnalysisInProgress && (
          <div className="text-center py-8">
            <div className="inline-block rounded-full border-4 border-t-primary border-r-primary border-b-gray-200 border-l-gray-200 w-12 h-12 animate-spin mb-4"></div>
            <p className="text-lg font-medium mb-2">Analysis in progress...</p>
            <p className="text-gray-500 text-sm mb-6">Processing with multiple detection models</p>
            
            <div className="max-w-md mx-auto space-y-4">
              <ProgressIndicator value={62} label="FaceForensics++ analysis" />
              <ProgressIndicator value={45} label="CNN-LSTM analysis" />
            </div>
          </div>
        )}
        
        {/* Completed analysis view */}
        {isAnalysisComplete && analysisData && (
          <div>
            {/* Result Summary */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:space-x-6 mb-6">
                <div className="md:w-1/2 mb-4 md:mb-0">
                  {/* This would be the actual image/video if we had it */}
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500 text-sm">
                      {analysisData.filetype.startsWith('image') 
                        ? 'Image preview not available' 
                        : 'Video preview not available'}
                    </p>
                  </div>
                </div>
                <div className="md:w-1/2">
                  <div className={`p-4 rounded-lg border ${analysisData.isDeepfake 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-green-200 bg-green-50'} mb-4`}
                  >
                    <div className="flex items-center mb-2">
                      {analysisData.isDeepfake ? (
                        <>
                          <AlertTriangle className="text-secondary mr-2 h-5 w-5" />
                          <h3 className="font-medium">DeepFake Detected</h3>
                        </>
                      ) : (
                        <>
                          <Info className="text-success mr-2 h-5 w-5" />
                          <h3 className="font-medium">Likely Authentic</h3>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">
                      This media has been classified as 
                      {analysisData.isDeepfake ? ' manipulated' : ' authentic'} with 
                      <span className="font-medium"> {analysisData.overallConfidence}% confidence</span> across multiple detection models.
                    </p>
                  </div>
                  
                  <h3 className="font-medium mb-2">Overall Detection Confidence</h3>
                  <div className="mb-1 flex justify-between items-center">
                    <span className="text-sm font-medium">{analysisData.overallConfidence}%</span>
                    <span className="text-xs text-secondary">
                      {analysisData.isDeepfake 
                        ? 'High probability of manipulation' 
                        : 'Low probability of manipulation'}
                    </span>
                  </div>
                  <ConfidenceMeter 
                    value={analysisData.overallConfidence} 
                    colorScheme={analysisData.isDeepfake ? "deepfake" : "authentic"}
                    size="lg"
                    className="mb-4"
                  />
                  
                  <h3 className="font-medium mb-2">Manipulation Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.manipulationTypes.map((type, index) => (
                      <Badge 
                        key={index}
                        variant={type.confidence > 80 ? "destructive" : "secondary"}
                        className="px-2 py-1 text-xs"
                      >
                        {type.type} ({type.confidence}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Model Results */}
            <h3 className="font-medium mb-4">Model-specific Results</h3>
            
            {analysisData.modelResults.map((result) => {
              const isExpanded = expandedModels.includes(result.modelId);
              
              return (
                <div key={result.modelId} className="border rounded-lg mb-4 overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-4 bg-gray-50 border-b cursor-pointer"
                    onClick={() => toggleModelDetails(result.modelId)}
                  >
                    <div>
                      <h4 className="font-medium">{result.modelName}</h4>
                      <p className="text-xs text-gray-500">{result.modelDescription}</p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-32 mr-4">
                        <ConfidenceMeter 
                          value={result.confidenceScore} 
                          colorScheme="deepfake"
                          size="sm"
                        />
                      </div>
                      <span className="text-secondary font-medium">{result.confidenceScore}%</span>
                      {isExpanded ? (
                        <ChevronUp className="ml-2 h-5 w-5" />
                      ) : (
                        <ChevronDown className="ml-2 h-5 w-5" />
                      )}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="p-4">
                      <div className="flex flex-col md:flex-row md:space-x-4">
                        <div className="md:w-1/2 mb-4 md:mb-0">
                          <h5 className="text-sm font-medium mb-2">
                            {result.modelName.includes("FaceForensics") 
                              ? "Detection Heatmap" 
                              : result.modelName.includes("CNN-LSTM") 
                                ? "Temporal Analysis" 
                                : "Analysis Visualization"}
                          </h5>
                          {/* This would be the actual visualization if we had it */}
                          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500 text-sm">Visualization not available</p>
                          </div>
                        </div>
                        <div className="md:w-1/2">
                          <h5 className="text-sm font-medium mb-2">Anomaly Details</h5>
                          <ul className="text-sm space-y-2">
                            {result.anomalies.map((anomaly, index) => (
                              <li key={index} className="flex items-start">
                                <span className={`mr-1 ${
                                  anomaly.severity === "high" 
                                    ? "text-secondary" 
                                    : anomaly.severity === "medium" 
                                      ? "text-warning" 
                                      : "text-gray-500"
                                }`}>
                                  <AlertTriangle className="h-4 w-4" />
                                </span>
                                <span>{anomaly.description}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Additional Information */}
            <div className="mt-8">
              <h3 className="font-medium mb-4">Metadata Analysis</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">File Information</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li className="flex justify-between">
                        <span>File Name:</span>
                        <span className="font-medium">{analysisData.metadata.fileInfo.filename}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>File Size:</span>
                        <span className="font-medium">
                          {(analysisData.metadata.fileInfo.filesize / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      </li>
                      {analysisData.metadata.fileInfo.duration && (
                        <li className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-medium">{analysisData.metadata.fileInfo.duration}</span>
                        </li>
                      )}
                      {analysisData.metadata.fileInfo.resolution && (
                        <li className="flex justify-between">
                          <span>Resolution:</span>
                          <span className="font-medium">{analysisData.metadata.fileInfo.resolution}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Technical Analysis</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li className="flex justify-between">
                        <span>Compression Level:</span>
                        <span className={`font-medium ${
                          analysisData.metadata.technicalAnalysis.compressionSuspicious 
                            ? 'text-warning' 
                            : ''
                        }`}>
                          {analysisData.metadata.technicalAnalysis.compressionLevel}
                          {analysisData.metadata.technicalAnalysis.compressionSuspicious && ' (Suspicious)'}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Encoding Format:</span>
                        <span className="font-medium">{analysisData.metadata.technicalAnalysis.encodingFormat}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Noise Pattern:</span>
                        <span className={`font-medium ${
                          analysisData.metadata.technicalAnalysis.noisePatternSuspicious 
                            ? 'text-secondary' 
                            : ''
                        }`}>
                          {analysisData.metadata.technicalAnalysis.noisePattern}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Metadata Consistency:</span>
                        <span className={`font-medium ${
                          analysisData.metadata.technicalAnalysis.metadataModified 
                            ? 'text-secondary' 
                            : ''
                        }`}>
                          {analysisData.metadata.technicalAnalysis.metadataConsistency}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
