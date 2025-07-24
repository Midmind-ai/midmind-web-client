import { EllipsisVerticalIcon } from 'lucide-react';

import { Button } from '@/shared/components/Button';

type Props = {
  content: string;
};

const LLMResponse = ({ content }: Props) => {
  return (
    <div className="mx-2.5 my-6">
      <div className="flex items-center justify-between mb-[18px]">
        <h6 className="text-blue-500 text-xs font-medium">Gemini 2.0 Flash</h6>
        <Button
          variant="secondary"
          className="size-6"
        >
          <EllipsisVerticalIcon />
        </Button>
      </div>
      <div
        className="font-light text-sm"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default LLMResponse;
