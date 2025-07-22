import { ThemedP } from '@/shared/components/ThemedP';

type Props = {
  text: string;
};

const UserMessage = ({ text }: Props) => {
  return (
    <div className="max-w-[465px] bg-zinc-100 p-2.5 rounded-[10px] mx-2.5 my-6 ml-auto">
      <ThemedP className="font-light text-sm">{text}</ThemedP>
    </div>
  );
};

export default UserMessage;
