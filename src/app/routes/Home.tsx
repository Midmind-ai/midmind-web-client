import { zodResolver } from '@hookform/resolvers/zod';
import { SendIcon, Sparkles, Brain, Zap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';

import { Button } from '@shared/components/Button';
import { Input } from '@shared/components/Input';
import { ThemedH1 } from '@shared/components/ThemedH1';
import { ThemedP } from '@shared/components/ThemedP';

import { LLModels } from '@shared/constants/api';
import { AppRoutes, SearchParams } from '@shared/constants/router';

import { useCreateChat } from '@/features/Chat/hooks/useCreateChat';

type FormData = {
  content: string;
};

const Home = () => {
  const navigate = useNavigate();
  const { createChat } = useCreateChat();

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
        const chatId = await createChat(data.content);

        navigate(`${AppRoutes.Chat(chatId)}?${SearchParams.Model}=${LLModels.Gemini20Flash}`);

        reset();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
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
                    placeholder="What's on your mind?"
                    className="h-12 text-base pr-12"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md transition-all duration-300 hover:scale-105 border border-primary/30"
                  >
                    <SendIcon className="h-4 w-4 text-white" />
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
