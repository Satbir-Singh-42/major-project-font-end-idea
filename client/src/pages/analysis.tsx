import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ResultsDisplay from "@/components/results-display";
import TechnicalDetails from "@/components/technical-details";
import RecommendedActions from "@/components/recommended-actions";
import { AnalysisResponse } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function Analysis() {
  const { mediaId } = useParams<{ mediaId: string }>();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [pollingInterval, setPollingInterval] = useState<number>(1000);

  // Query for analysis status
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: [`/api/analysis/${mediaId}/status`],
    refetchInterval: pollingInterval,
  });

  // Status-dependent polling
  useEffect(() => {
    if (statusData?.status === 'completed' || statusData?.status === 'failed') {
      setPollingInterval(0); // Stop polling when analysis is complete or failed
    } else {
      setPollingInterval(1000); // Poll every second while processing
    }
  }, [statusData?.status]);

  // Query for analysis results
  const { 
    data: analysisData, 
    isLoading: analysisLoading,
    isError: analysisError,
    error: analysisErrorData
  } = useQuery<AnalysisResponse>({
    queryKey: [`/api/analysis/${mediaId}`],
    enabled: statusData?.status === 'completed',
    refetchInterval: 0, // No need to refetch once we have the results
  });

  // Show error toast if analysis fails
  useEffect(() => {
    if (statusData?.status === 'failed') {
      toast({
        title: "Analysis Failed",
        description: "There was an error processing your media file.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [statusData?.status, toast]);

  // Show error toast if fetching results fails
  useEffect(() => {
    if (analysisError) {
      toast({
        title: "Error Loading Results",
        description: analysisErrorData instanceof Error ? analysisErrorData.message : "Failed to load analysis results",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [analysisError, analysisErrorData, toast]);

  // Handle back button click
  const handleBackClick = () => {
    setLocation('/');
  };

  // Determine the analysis status
  const isAnalysisComplete = statusData?.status === 'completed';
  const isAnalysisInProgress = statusData?.status === 'pending' || statusData?.status === 'processing';
  const isAnalysisError = statusData?.status === 'failed' || analysisError;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button 
        variant="ghost"
        className="mb-4 flex items-center"
        onClick={handleBackClick}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Upload
      </Button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">DeepFake Analysis</h1>
        <p className="text-gray-600">
          {isAnalysisInProgress ? 'Processing your media with multiple detection models...' : 
           isAnalysisComplete ? 'Analysis complete. Review the detailed results below.' :
           isAnalysisError ? 'There was an error analyzing your media.' :
           'Loading analysis status...'}
        </p>
      </div>

      <div className="space-y-6">
        <ResultsDisplay 
          isAnalysisComplete={isAnalysisComplete}
          isAnalysisInProgress={isAnalysisInProgress}
          analysisData={analysisData}
          isLoading={statusLoading || (isAnalysisComplete && analysisLoading)}
        />

        {isAnalysisComplete && analysisData && (
          <>
            <TechnicalDetails analysisData={analysisData} />
            <RecommendedActions isDeepfake={analysisData.isDeepfake} confidence={analysisData.overallConfidence} />
          </>
        )}
      </div>
    </div>
  );
}
