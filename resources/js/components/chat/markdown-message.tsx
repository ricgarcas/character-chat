import ReactMarkdown, { type Components } from 'react-markdown';

interface MarkdownMessageProps {
    children: string;
    className?: string;
    streaming?: boolean;
    accent?: string;
}

export function MarkdownMessage({ children, className, streaming = false, accent }: MarkdownMessageProps) {
    const components: Components = {
        p: ({ children }) => (
            <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>
        ),
        ul: ({ children }) => (
            <ul className="mb-2 list-disc list-inside space-y-0.5">{children}</ul>
        ),
        ol: ({ children }) => (
            <ol className="mb-2 list-decimal list-inside space-y-0.5">{children}</ol>
        ),
        li: ({ children }) => <li>{children}</li>,
        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ className: cn, children }) => {
            const isBlock = /language-/.test(cn ?? '');
            if (isBlock) {
                return <code className={cn}>{children}</code>;
            }
            return (
                <code className="px-1 py-0.5 bg-[var(--bg-tile)] border border-[var(--ink-faint)] text-[0.9em]">
                    {children}
                </code>
            );
        },
        pre: ({ children }) => (
            <pre className="mb-2 p-2 bg-[var(--bg-tile)] border-2 border-[var(--ink)] overflow-x-auto text-sm">
                {children}
            </pre>
        ),
        a: ({ href, children }) => (
            <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="underline"
                style={accent ? { color: accent } : undefined}
            >
                {children}
            </a>
        ),
        h1: ({ children }) => (
            <h1 className="mb-2 font-display text-lg uppercase font-bold tracking-widest">{children}</h1>
        ),
        h2: ({ children }) => (
            <h2 className="mb-2 font-display text-base uppercase font-bold tracking-widest">{children}</h2>
        ),
        h3: ({ children }) => (
            <h3 className="mb-1 font-display text-sm uppercase font-bold tracking-widest">{children}</h3>
        ),
        blockquote: ({ children }) => (
            <blockquote className="mb-2 border-l-2 border-[var(--ink-faint)] pl-3 italic text-[var(--ink-faint)]">
                {children}
            </blockquote>
        ),
        hr: () => <hr className="my-3 border-[var(--ink-faint)]" />,
    };

    return (
        <div className={className}>
            <ReactMarkdown components={components}>{children}</ReactMarkdown>
            {streaming && (
                <span className="ml-1 inline-block animate-pulse text-[var(--ink-faint)]">▌</span>
            )}
        </div>
    );
}
