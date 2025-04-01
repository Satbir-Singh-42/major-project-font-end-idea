import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Search, HelpCircle } from 'lucide-react';

interface RecommendedActionsProps {
  isDeepfake: boolean;
  confidence: number;
}

export default function RecommendedActions({ isDeepfake, confidence }: RecommendedActionsProps) {
  return (
    <Card className="shadow transition-all duration-300 hover:shadow-md mb-8">
      <CardContent className="p-6">
        <h2 className="text-xl font-medium mb-4">Recommended Actions</h2>
        
        <div className="space-y-4">
          {isDeepfake && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <h3 className="font-medium flex items-center">
                <AlertTriangle className="text-secondary mr-2 h-5 w-5" />
                Treat Media as Potentially Misleading
              </h3>
              <p className="text-sm mt-1">
                This content has a high probability of being manipulated. It should not be used as evidence 
                or shared without disclosure of potential manipulation.
              </p>
            </div>
          )}
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-medium flex items-center">
              <Search className="text-primary mr-2 h-5 w-5" />
              Verify from Additional Sources
            </h3>
            <p className="text-sm mt-1">
              Cross-reference this content with other reliable sources to confirm authenticity before 
              making judgments based on it.
            </p>
          </div>
          
          {confidence > 60 && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <h3 className="font-medium flex items-center">
                <HelpCircle className="text-warning mr-2 h-5 w-5" />
                Request Expert Analysis
              </h3>
              <p className="text-sm mt-1">
                For high-stakes situations, consider requesting additional forensic analysis from 
                specialized services.
              </p>
            </div>
          )}
          
          {!isDeepfake && confidence < 40 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <h3 className="font-medium flex items-center">
                <svg className="text-success mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Media Appears Authentic
              </h3>
              <p className="text-sm mt-1">
                This content shows no significant signs of manipulation according to our analysis, but 
                always exercise critical judgment when evaluating media.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
