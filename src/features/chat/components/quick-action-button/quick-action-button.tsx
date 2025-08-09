import { Button } from '@shared/components/ui/button';
import { ThemedSpan } from '@shared/components/ui/themed-span';

type Props = {
  icon: React.ReactNode;
  label: string;
  onClick: VoidFunction;
};

const QuickActionButton = ({ icon, label, onClick }: Props) => {
  return (
    <Button
      variant="ghost"
      className="border-base hover:border-muted-foreground flex h-[104px] w-full
        max-w-[162px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl
        border-1 border-dashed p-4 transition-colors duration-200 hover:bg-transparent"
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
