import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface AnalysisSettingsProps {
  sensitivity: number;
  options: {
    detailedReport: boolean;
    highlightAnomalies: boolean;
    showComparison: boolean;
  };
  onSensitivityChange: (value: number) => void;
  onOptionChange: (name: string, value: boolean) => void;
}

export default function AnalysisSettings({ 
  sensitivity, 
  options, 
  onSensitivityChange, 
  onOptionChange 
}: AnalysisSettingsProps) {
  
  const handleSensitivityChange = (values: number[]) => {
    onSensitivityChange(values[0]);
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    onOptionChange(name, checked);
  };

  return (
    <Card className="shadow-lg transition-all duration-300 hover:shadow-xl border-t-4 border-t-primary">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4 text-gradient">Analysis Settings</h2>
        
        <div className="mb-8">
          <Label className="block text-sm font-medium text-gray-800 mb-3">
            Detection Sensitivity
          </Label>
          <div className="px-1">
            <Slider 
              defaultValue={[sensitivity]} 
              max={10} 
              min={1} 
              step={1}
              value={[sensitivity]}
              onValueChange={handleSensitivityChange}
              className="mb-2"
            />
          </div>
          <div className="flex justify-between text-xs mt-2">
            <span className="text-blue-600 font-medium">Lower ({sensitivity <= 3 ? 'Current' : ''})</span>
            <span className="text-gray-600 font-medium">{sensitivity > 3 && sensitivity < 8 ? 'Current: ' + sensitivity : ''}</span>
            <span className="text-pink-600 font-medium">Higher ({sensitivity >= 8 ? 'Current' : ''})</span>
          </div>
          <p className="text-xs text-gray-500 mt-3 italic">
            {sensitivity <= 3 
              ? 'Lower sensitivity reduces false positives but may miss subtle manipulations.' 
              : sensitivity >= 8 
                ? 'Higher sensitivity catches subtle manipulations but may lead to more false positives.'
                : 'Balanced setting for most analysis scenarios.'}
          </p>
        </div>
        
        <div className="space-y-5 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="detailedReport" 
              checked={options.detailedReport}
              onCheckedChange={(checked) => 
                handleCheckboxChange('detailedReport', checked as boolean)
              }
              className="mt-0.5"
            />
            <div>
              <Label htmlFor="detailedReport" className="text-sm font-medium text-gray-800">
                Generate detailed report
              </Label>
              <p className="text-xs text-gray-500 mt-0.5">Includes comprehensive technical analysis and evidence points</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="highlightAnomalies"
              checked={options.highlightAnomalies}
              onCheckedChange={(checked) => 
                handleCheckboxChange('highlightAnomalies', checked as boolean)
              }
              className="mt-0.5"
            />
            <div>
              <Label htmlFor="highlightAnomalies" className="text-sm font-medium text-gray-800">
                Highlight detected anomalies
              </Label>
              <p className="text-xs text-gray-500 mt-0.5">Visually mark suspicious areas in images or videos</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="showComparison"
              checked={options.showComparison}
              onCheckedChange={(checked) => 
                handleCheckboxChange('showComparison', checked as boolean)
              }
              className="mt-0.5"
            />
            <div>
              <Label htmlFor="showComparison" className="text-sm font-medium text-gray-800">
                Show side-by-side comparison
              </Label>
              <p className="text-xs text-gray-500 mt-0.5">Compare original areas with suspected manipulated regions</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
