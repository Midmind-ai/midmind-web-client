import { Button } from '@/shared/components/ui/button';
import { ThemedSpan } from '@/shared/components/ui/themed-span';

type Props = {
  icon: React.ReactNode;
  label: string;
  onClick: VoidFunction;
};

const QuickActionButton = ({ icon, label, onClick }: Props) => {
  return (
    <Button
      variant="ghost"
      className="p-4 h-[104px] flex flex-col items-center justify-center gap-2 border-1 border-base border-dashed cursor-pointer w-full max-w-[162px] rounded-xl hover:bg-transparent hover:border-muted-foreground transition-colors duration-200"
      onClick={onClick}
    >
      <div>{icon}</div>
      <ThemedSpan className="text-center text-sm font-light break-words whitespace-normal">
        {label}
      </ThemedSpan>
    </Button>
  );
};

export default QuickActionButton;
