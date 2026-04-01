'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import DOMPurify from 'dompurify'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const sanitized = typeof window !== 'undefined' ? DOMPurify.sanitize(content) : content

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-white mb-4 leading-tight">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-white mb-3 mt-6 leading-tight">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium text-white mb-2 mt-4">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-medium text-white/90 mb-2 mt-3">{children}</h4>
          ),
          p: ({ children }) => (
            <p className="text-white/70 text-base leading-relaxed mb-4">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="text-white font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-white/80 italic">{children}</em>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-white/70 space-y-1 mb-4 pl-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-white/70 space-y-1 mb-4 pl-2">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-white/70 leading-relaxed">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-amber-400/50 pl-4 my-4 text-white/50 italic">
              {children}
            </blockquote>
          ),
          code: ({ children, className: cls, ...props }) => {
            const isBlock = cls?.includes('language-')
            return isBlock ? (
              <pre className="bg-white/[0.04] border border-white/10 rounded-xl p-4 overflow-x-auto text-sm text-white/80 mb-4">
                <code className={cls}>{children}</code>
              </pre>
            ) : (
              <code className="bg-white/[0.06] px-1.5 py-0.5 rounded text-sm text-amber-300/80" {...props}>
                {children}
              </code>
            )
          },
          hr: () => <hr className="border-white/10 my-6" />,
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm text-white/70 border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="text-left text-white font-medium border-b border-white/20 pb-2 pr-4">{children}</th>
          ),
          td: ({ children }) => (
            <td className="text-white/60 py-2 pr-4 border-b border-white/[0.06]">{children}</td>
          ),
        }}
      >
        {sanitized}
      </ReactMarkdown>
    </div>
  )
}
