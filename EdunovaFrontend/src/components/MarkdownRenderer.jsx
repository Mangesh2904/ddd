import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="prose prose-gray dark:prose-invert prose-sm sm:prose-base max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Enhanced headers with better visual hierarchy
          h1: ({ children }) => (
            <div className="mb-6 mt-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b-2 border-gradient-to-r from-blue-500 to-purple-600">
                {children}
              </h1>
            </div>
          ),
          h2: ({ children }) => (
            <div className="mb-4 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-3"></div>
                {children}
              </h2>
            </div>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-5">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">
              {children}
            </h4>
          ),
          // Enhanced paragraphs
          p: ({ children }) => (
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-7 text-sm sm:text-base">
              {children}
            </p>
          ),
          // Enhanced lists with better spacing and bullets
          ul: ({ children }) => (
            <ul className="space-y-2 mb-6 ml-6">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 mb-6 ml-6 list-decimal">
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => {
            const isOrdered = props.ordered;
            return (
              <li className={`text-gray-700 dark:text-gray-300 leading-6 ${isOrdered ? 'list-decimal' : 'list-none'} relative`}>
                {!isOrdered && (
                  <span className="absolute -left-6 top-1.5 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></span>
                )}
                <span className="block">{children}</span>
              </li>
            );
          },
          // Enhanced code styling
          code: ({ inline, children, className }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="mb-6">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-t-lg px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    {match[1]}
                  </span>
                </div>
                <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-b-lg overflow-x-auto">
                  <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-md text-sm font-mono">
                {children}
              </code>
            );
          },
          // Enhanced blockquotes
          blockquote: ({ children }) => (
            <div className="mb-6">
              <blockquote className="border-l-4 border-gradient-to-b from-blue-500 to-purple-600 bg-blue-50 dark:bg-blue-900/10 pl-6 py-4 rounded-r-lg">
                <div className="text-gray-700 dark:text-gray-300 italic">
                  {children}
                </div>
              </blockquote>
            </div>
          ),
          // Enhanced strong text
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900 dark:text-white bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">
              {children}
            </strong>
          ),
          // Enhanced emphasis
          em: ({ children }) => (
            <em className="italic text-blue-600 dark:text-blue-400">
              {children}
            </em>
          ),
          // Enhanced horizontal rules
          hr: () => (
            <div className="my-8">
              <hr className="border-0 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
            </div>
          ),
          // Enhanced tables
          table: ({ children }) => (
            <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  {children}
                </table>
              </div>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              {children}
            </th>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              {children}
            </tr>
          ),
          td: ({ children }) => (
            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
              {children}
            </td>
          ),
          // Enhanced links
          a: ({ children, href }) => (
            <a 
              href={href} 
              className="text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400 underline decoration-2 underline-offset-2 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;