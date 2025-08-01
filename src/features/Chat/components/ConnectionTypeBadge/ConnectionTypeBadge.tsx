import { GitMerge } from 'lucide-react';

type Props = {
  connectionType: string;
  bgColor: string;
};

const ConnectionTypeBadge = ({ bgColor, connectionType }: Props) => {
  return (
    <div
      className="inline-flex items-center gap-x-1.5 p-1 rounded-[6px]"
      style={{ backgroundColor: bgColor }}
    >
      <GitMerge className="text-white w-[18px] h-[18px]" />
      <div className="px-1.5  bg-secondary/50 rounded-sm">
        <span
          className="text-sm font-medium leading-none"
          style={{ color: bgColor }}
        >
          {connectionType[0].toUpperCase() + connectionType.slice(1)}
        </span>
      </div>
    </div>
  );
};

export default ConnectionTypeBadge;
