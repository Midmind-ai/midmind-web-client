declare module '*.svg' {
  import type { FC } from 'react';

  const content: FC<React.SVGProps<SVGElement>>;
  export default content;
}
