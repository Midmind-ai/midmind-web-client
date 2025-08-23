const TypingDots = () => (
  <div className="flex items-center gap-1.5">
    <div
      className="from-muted-foreground to-muted-foreground/40 h-2 w-2 animate-bounce
        rounded-full bg-gradient-to-br shadow-md"
      style={{ animationDelay: '0ms' }}
    />
    <div
      className="from-muted-foreground to-muted-foreground/30 h-2 w-2 animate-bounce
        rounded-full bg-gradient-to-br shadow-md"
      style={{ animationDelay: '150ms' }}
    />
    <div
      className="from-muted-foreground to-muted-foreground/20 h-2 w-2 animate-bounce
        rounded-full bg-gradient-to-br shadow-md"
      style={{ animationDelay: '300ms' }}
    />
  </div>
);

export default TypingDots;
