import * as React from 'react';
import { useState } from 'react';

import { EyeIcon, EyeOffIcon } from 'lucide-react';

import { Button } from '@shared/components/Button';

import { cn } from '@shared/utils/cn';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handlePasswordVisibility = () => setIsPasswordVisible(prev => !prev);

  return (
    <div className="relative">
      <input
        type={isPasswordVisible ? 'text' : type}
        data-slot="input"
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          type === 'password' && 'pr-12',
          className
        )}
        {...props}
      />
      {type === 'password' && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handlePasswordVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 p-0"
        >
          {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
        </Button>
      )}
    </div>
  );
}

export { Input };
