import { ThemedSpan } from '@/shared/components/ThemedSpan';

type Props = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
};

const QuickActionButton = ({ icon, label, onClick }: Props) => {
  return (
    <div
      className="p-3 flex flex-col items-center justify-center gap-2 border-1 border-base border-dashed cursor-pointer w-full max-w-[162px] rounded-xl hover:border-muted-foreground transition-colors duration-200"
      onClick={onClick}
    >
      {icon}
      <ThemedSpan className="text-center text-sm font-light">{label}</ThemedSpan>
    </div>
  );
};

export default QuickActionButton;
