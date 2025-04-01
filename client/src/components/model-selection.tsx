import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModelInfo } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

interface ModelSelectionProps {
  availableModels: ModelInfo[];
  isLoading: boolean;
  onChange: (selectedModels: ModelInfo[]) => void;
}

export default function ModelSelection({ availableModels, isLoading, onChange }: ModelSelectionProps) {
  const [models, setModels] = useState<ModelInfo[]>([]);

  // Initialize models when availableModels changes
  useEffect(() => {
    if (availableModels.length > 0) {
      const initialModels = availableModels.map(model => ({
        ...model,
        isSelected: model.name === 'FaceForensics++' || model.name === 'CNN-LSTM'
      }));
      setModels(initialModels);
      
      // Notify parent of initially selected models
      const selectedModels = initialModels.filter(model => model.isSelected);
      onChange(selectedModels);
    }
  }, [availableModels, onChange]);

  const handleModelClick = (id: number) => {
    const updatedModels = models.map(model => 
      model.id === id ? { ...model, isSelected: !model.isSelected } : model
    );
    setModels(updatedModels);
    
    // Notify parent of selected models
    const selectedModels = updatedModels.filter(model => model.isSelected);
    onChange(selectedModels);
  };

  const handleSelectAll = () => {
    const allSelected = models.every(model => model.isSelected);
    const updatedModels = models.map(model => ({ ...model, isSelected: !allSelected }));
    setModels(updatedModels);
    
    // Notify parent of selected models
    const selectedModels = allSelected ? [] : [...updatedModels];
    onChange(selectedModels);
  };

  // Render loading skeletons
  if (isLoading) {
    return (
      <Card className="shadow">
        <CardContent className="p-6">
          <h2 className="text-xl font-medium mb-4">Detection Models</h2>
          <p className="text-sm text-gray-500 mb-4">Select which AI models to use for analysis:</p>
          
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="mb-3">
              <Skeleton className="h-[76px] w-full rounded-md" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg transition-all duration-300 hover:shadow-xl border-t-4 border-t-primary">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4 text-gradient">AI Detection Models</h2>
        <p className="text-sm text-gray-600 mb-5">Select which AI models to use for deepfake analysis:</p>
        
        {models.map(model => (
          <div 
            key={model.id}
            className={`flex justify-between items-center p-4 border rounded-lg mb-4 cursor-pointer transition-all duration-200 ${
              model.isSelected 
                ? 'bg-primary/10 border-primary shadow-md' 
                : 'hover:bg-gray-50 hover:shadow-sm hover:scale-[1.01]'
            }`}
            onClick={() => handleModelClick(model.id)}
          >
            <div>
              <h3 className="font-semibold text-gray-800">{model.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{model.description}</p>
            </div>
            <div className={`rounded-full p-1 transition-colors ${
              model.isSelected 
                ? 'bg-primary/20 text-primary' 
                : 'text-gray-300 bg-gray-100'
            }`}>
              <Check size={18} />
            </div>
          </div>
        ))}
        
        <div className="mt-6 flex justify-end">
          <Button 
            variant="outline" 
            className="font-medium border-primary text-primary hover:bg-primary/5 transition-all duration-200" 
            onClick={handleSelectAll}
          >
            {models.every(model => model.isSelected) ? 'Deselect All Models' : 'Select All Models'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
