const TypingDots = () => {
  return (
    <div className="flex space-x-1">
      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500"></div>
      <div
        className="h-2 w-2 animate-bounce rounded-full bg-gray-500"
        style={{ animationDelay: '0.1s' }}
      ></div>
      <div
        className="h-2 w-2 animate-bounce rounded-full bg-gray-500"
        style={{ animationDelay: '0.2s' }}
      ></div>
    </div>
  );
};

export default TypingDots;
