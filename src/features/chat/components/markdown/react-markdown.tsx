import { memo } from 'react';

import LibReactMarkDown from 'react-markdown';

import { ThemedP } from '@components/ui/themed-p';

type Props = {
  content: string;
};

const ReactMarkdown = ({ content }: Props) => {
  return (
    <LibReactMarkDown
      components={{
        p: ({ children }) => (
          <ThemedP className="mb-4 text-base leading-7 font-light">{children}</ThemedP>
        ),
        h1: ({ children }) => (
          <h1
            className="mt-6 mb-4 border-b border-gray-200 pb-2 text-2xl font-bold
              dark:border-gray-700"
          >
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mt-5 mb-3 text-xl font-semibold">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-4 mb-3 text-lg font-semibold">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="mt-3 mb-2 text-base font-semibold">{children}</h4>
        ),
        h5: ({ children }) => (
          <h5 className="mt-3 mb-2 text-base font-semibold">{children}</h5>
        ),
        h6: ({ children }) => (
          <h6 className="mt-3 mb-2 text-xs font-semibold tracking-wide uppercase">
            {children}
          </h6>
        ),
        ul: ({ children }) => (
          <ul className="mb-4 ml-4 list-disc space-y-2">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-4 ml-4 list-decimal space-y-2">{children}</ol>
        ),
        li: ({ children }) => (
          <li
            className="pl-2 text-base leading-6 font-light marker:text-blue-500
              dark:marker:text-blue-400"
          >
            {children}
          </li>
        ),
        code: ({ children }) => (
          <code
            className="rounded-md border border-gray-200 bg-gray-100 px-2 py-1 font-mono
              text-xs dark:border-gray-700 dark:bg-gray-800"
          >
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="mb-4 overflow-x-auto rounded-lg border-1 p-4">
            <code className="font-mono text-xs leading-6">{children}</code>
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote
            className="mb-4 rounded-r-lg border-l-4 border-blue-500 bg-blue-50 py-2 pl-4
              italic dark:border-blue-400 dark:bg-blue-900/20"
          >
            <div className="text-base leading-6 font-light">{children}</div>
          </blockquote>
        ),
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        a: ({ children, href }) => (
          <a
            href={href}
            className="text-blue-600 underline decoration-2 underline-offset-2
              transition-colors duration-200 hover:text-blue-800 dark:text-blue-400
              dark:hover:text-blue-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="my-6 border-gray-200 dark:border-gray-700" />,
        table: ({ children }) => (
          <div className="mb-4 overflow-x-auto">
            <table className="min-w-full rounded-lg border-1">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th
            className="border-b border-gray-200 bg-gray-100 px-4 py-2 text-left text-base
              font-semibold dark:border-gray-700 dark:bg-gray-800"
          >
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td
            className="border-b border-gray-200 px-4 py-2 text-base dark:border-gray-700"
          >
            {children}
          </td>
        ),
      }}
    >
      {content}
    </LibReactMarkDown>
  );
};

export default memo(ReactMarkdown);
