import { memo } from 'react';

import LibReactMarkDown from 'react-markdown';

import { ThemedP } from '@shared/components/ui/themed-p';

/**
  ReactMarkdown is moved to a separate file and memoised for a few reasons:
  1. The text can be highlighted, but it gets highlighted by changing DOM (adding <span /> tags). 
     But the ReactMarkdown doesn't know about DOM changes. When a re-render happens React tries to tries to update ReactMarkdown nodes
     that no longer exist or changed, as a result we get an error. 
     You can reproduce this bug from this component, if you make any small change and save the file while web is opened you'll get the error. 
     * The solution to the problem is to tell ReactMarkdown how to render highlights from the beginning. This means backend or frontend should send/parse predefined 
     * markdown and ReactMarkdown should now how to deal with it
  2. It's a visual reason. Easer to read a consumer component 
**/

type Props = {
  content: string;
};

const ReactMarkdown = ({ content }: Props) => {
  return (
    <LibReactMarkDown
      components={{
        p: ({ children }) => (
          <ThemedP className="text-base font-light leading-7 mb-4">{children}</ThemedP>
        ),
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold mb-4 mt-6 border-b border-gray-200 dark:border-gray-700 pb-2">
            {children}
          </h1>
        ),
        h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 mt-5">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-semibold mb-3 mt-4">{children}</h3>,
        h4: ({ children }) => <h4 className="text-base font-semibold mb-2 mt-3">{children}</h4>,
        h5: ({ children }) => <h5 className="text-base font-semibold mb-2 mt-3">{children}</h5>,
        h6: ({ children }) => (
          <h6 className="text-xs font-semibold mb-2 mt-3 uppercase tracking-wide">{children}</h6>
        ),
        ul: ({ children }) => <ul className="list-disc mb-4 space-y-2 ml-4">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal mb-4 space-y-2 ml-4">{children}</ol>,
        li: ({ children }) => (
          <li className="text-base font-light leading-6 marker:text-blue-500 dark:marker:text-blue-400 pl-2">
            {children}
          </li>
        ),
        code: ({ children }) => (
          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-xs font-mono border border-gray-200 dark:border-gray-700">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4 overflow-x-auto border border-gray-200 dark:border-gray-700 shadow-sm">
            <code className="text-xs font-mono leading-6">{children}</code>
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 italic mb-4 bg-blue-50 dark:bg-blue-900/20 py-2 rounded-r-lg">
            <div className="text-base font-light leading-6">{children}</div>
          </blockquote>
        ),
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        a: ({ children, href }) => (
          <a
            href={href}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline decoration-2 underline-offset-2 transition-colors duration-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="my-6 border-gray-200 dark:border-gray-700" />,
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-left text-base font-semibold border-b border-gray-200 dark:border-gray-700">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 text-base border-b border-gray-200 dark:border-gray-700">
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
