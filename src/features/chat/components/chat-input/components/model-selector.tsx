import { ChevronDownIcon } from 'lucide-react';
import { memo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@components/ui/select';
import { Separator } from '@components/ui/separator';
import { AI_MODELS } from '@constants/ai-models';
import type { AIModel } from '@shared-types/entities';
import { useAiModelStore } from '@stores/ai-model.store';

type Props = {
  disabled?: boolean;
  onModelChange?: (model: AIModel) => void;
};

const ModelSelector = ({ disabled = false, onModelChange }: Props) => {
  const currentModel = useAiModelStore(state => state.currentModel);
  const setCurrentModel = useAiModelStore(state => state.setCurrentModel);

  // Helper function to get model info by ID
  const getModelInfo = (modelId: string) => {
    return Object.values(AI_MODELS).find(model => model.id === modelId);
  };

  const handleValueChange = (value: string) => {
    const model = value as AIModel;
    setCurrentModel(model);
    onModelChange?.(model);
  };

  return (
    <Select
      value={currentModel}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger
        size="sm"
        className="my-0.5 min-w-fit gap-0 self-end p-0 transition-colors
          hover:bg-neutral-50"
      >
        <div className="flex items-center gap-1.5 px-3">
          {getModelInfo(currentModel)?.image && (
            <img
              src={getModelInfo(currentModel)?.image}
              alt={getModelInfo(currentModel)?.name}
              className="h-4 w-4 flex-shrink-0"
            />
          )}
          <span className="text-xs whitespace-nowrap">
            {getModelInfo(currentModel)?.shortName || currentModel}
          </span>
        </div>
        <Separator orientation="vertical" />
        <div className="flex items-center justify-center px-1">
          <ChevronDownIcon className="size-4" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={AI_MODELS.GEMINI_2_0_FLASH_LITE.id}>
          <div className="flex items-center gap-1.5">
            <img
              src={AI_MODELS.GEMINI_2_0_FLASH_LITE.image}
              alt={AI_MODELS.GEMINI_2_0_FLASH_LITE.name}
              className="h-4 w-4"
            />
            <span>{AI_MODELS.GEMINI_2_0_FLASH_LITE.shortName}</span>
          </div>
        </SelectItem>
        <SelectItem value={AI_MODELS.GEMINI_2_0_FLASH.id}>
          <div className="flex items-center gap-1.5">
            <img
              src={AI_MODELS.GEMINI_2_0_FLASH.image}
              alt={AI_MODELS.GEMINI_2_0_FLASH.name}
              className="h-4 w-4"
            />
            <span>{AI_MODELS.GEMINI_2_0_FLASH.shortName}</span>
          </div>
        </SelectItem>
        <SelectItem value={AI_MODELS.GEMINI_2_5_FLASH.id}>
          <div className="flex items-center gap-1.5">
            <img
              src={AI_MODELS.GEMINI_2_5_FLASH.image}
              alt={AI_MODELS.GEMINI_2_5_FLASH.name}
              className="h-4 w-4"
            />
            <span>{AI_MODELS.GEMINI_2_5_FLASH.shortName}</span>
          </div>
        </SelectItem>
        <SelectItem value={AI_MODELS.GEMINI_2_5_PRO.id}>
          <div className="flex items-center gap-1.5">
            <img
              src={AI_MODELS.GEMINI_2_5_PRO.image}
              alt={AI_MODELS.GEMINI_2_5_PRO.name}
              className="h-4 w-4"
            />
            <span>{AI_MODELS.GEMINI_2_5_PRO.shortName}</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default memo(ModelSelector);
