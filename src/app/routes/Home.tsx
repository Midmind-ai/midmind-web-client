import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, Brain, Zap, SendHorizonal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';

import { Button } from '@shared/components/Button';
import { Input } from '@shared/components/Input';
import { ThemedH1 } from '@shared/components/ThemedH1';
import { ThemedP } from '@shared/components/ThemedP';

import { AppRoutes, SearchParams } from '@shared/constants/router';

import { useCreateChat } from '@/features/Chat/hooks/useCreateChat';
import { useAbortControllerStore } from '@/shared/stores/useAbortControllerStore';

type FormData = {
  content: string;
};

const Home = () => {
  const navigate = useNavigate();
  const { createChat } = useCreateChat();
  const { createAbortController } = useAbortControllerStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(
      z.object({
        content: z.string().min(1).trim(),
      })
    ),
    mode: 'onChange',
  });

  const sendMessage = async (data: FormData) => {
    if (data.content.trim()) {
      try {
        const abortController = createAbortController();

        const chatId = await createChat({
          content: data.content,
          model: 'gemini-2.0-flash',
          sendMessage: true,
          abortController,
        });

        navigate(`${AppRoutes.Chat(chatId)}?${SearchParams.Model}=gemini-2.0-flash`);

        reset();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-5xl w-full space-y-12">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-primary to-primary/80 rounded-xl shadow-xl border border-primary/30">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div className="p-2 bg-gradient-to-r from-primary to-primary/80 rounded-xl shadow-xl border border-primary/30">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="p-2 bg-gradient-to-r from-primary to-primary/80 rounded-xl shadow-xl border border-primary/30">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
            <ThemedH1 className="text-3xl md:text-5xl font-bold leading-tight drop-shadow-lg filter contrast-125">
              Welcome to Midmind
            </ThemedH1>
            <ThemedP className="text-base md:text-lg text-foreground max-w-2xl mx-auto leading-relaxed font-medium">
              Your intelligent AI assistant. Ask me anything, and I'll help you find the answers you
              need with lightning-fast responses.
            </ThemedP>
          </div>
          <div className="flex flex-col items-center space-y-6">
            <div className="w-full max-w-3xl">
              <form
                onSubmit={handleSubmit(sendMessage)}
                className="relative group"
              >
                <div className="relative">
                  <Input
                    {...register('content')}
                    autoComplete="off"
                    placeholder="Write your thoughts..."
                    className="h-12 text-base pr-12"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md transition-all duration-300 hover:scale-105 border border-primary/30"
                  >
                    <SendHorizonal className="text-background" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
