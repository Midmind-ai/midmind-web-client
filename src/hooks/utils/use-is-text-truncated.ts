import { useRef, useState, useEffect } from 'react';

export const useIsTextTruncated = (text: string) => {
  const textRef = useRef<HTMLSpanElement | HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        const element = textRef.current;
        setIsTruncated(element.scrollWidth > element.clientWidth);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);

    return () => window.removeEventListener('resize', checkTruncation);
  }, [text]);

  return { textRef, isTruncated };
};
