import ReactMarkdown from 'react-markdown';

import { useLLMResponseLogic } from '@/features/Chat/components/LLMResponse/useLLMResponseLogic';
import { ThemedP } from '@/shared/components/ThemedP';

type Props = {
  content: string;
  id: string;
  onContentChange: VoidFunction;
};

const LLMResponse = ({ content, id, onContentChange }: Props) => {
  const { currentModel, streamingContent } = useLLMResponseLogic(id, content, onContentChange);

  return (
    <div className="m-2.5">
      <h6 className="text-blue-500 text-xs font-medium mb-3 tracking-wide uppercase">
        {currentModel}
      </h6>
      <div className="text-sm font-light leading-relaxed">
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <ThemedP className="text-sm font-light leading-7 mb-4 text-gray-700 dark:text-gray-300">
                {children}
              </ThemedP>
            ),
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mb-4 mt-6 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold mb-3 mt-5 text-gray-900 dark:text-gray-100">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold mb-3 mt-4 text-gray-900 dark:text-gray-100">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-base font-semibold mb-2 mt-3 text-gray-900 dark:text-gray-100">
                {children}
              </h4>
            ),
            h5: ({ children }) => (
              <h5 className="text-sm font-semibold mb-2 mt-3 text-gray-900 dark:text-gray-100">
                {children}
              </h5>
            ),
            h6: ({ children }) => (
              <h6 className="text-xs font-semibold mb-2 mt-3 text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                {children}
              </h6>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4 text-gray-700 dark:text-gray-300">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-4 space-y-2 ml-4 text-gray-700 dark:text-gray-300">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-sm font-light leading-6 marker:text-blue-500 dark:marker:text-blue-400">
                {children}
              </li>
            ),
            code: ({ children }) => (
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-xs font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4 overflow-x-auto border border-gray-200 dark:border-gray-700 shadow-sm">
                <code className="text-xs font-mono text-gray-800 dark:text-gray-200 leading-6">
                  {children}
                </code>
              </pre>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 italic mb-4 bg-blue-50 dark:bg-blue-900/20 py-2 rounded-r-lg">
                <div className="text-sm font-light text-gray-700 dark:text-gray-300 leading-6">
                  {children}
                </div>
              </blockquote>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic text-gray-700 dark:text-gray-300">{children}</em>
            ),
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
              <th className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                {children}
              </td>
            ),
          }}
        >
          {streamingContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default LLMResponse;
