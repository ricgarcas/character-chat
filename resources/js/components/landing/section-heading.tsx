interface Props {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    accent?: string;
    className?: string;
}

export default function SectionHeading({
    eyebrow,
    title,
    subtitle,
    accent = 'var(--accent-dali)',
    className = '',
}: Props) {
    return (
        <div className={`mx-auto max-w-3xl text-center ${className}`}>
            {eyebrow && (
                <p className="font-display text-[10px] uppercase tracking-[0.35em]" style={{ color: accent }}>
                    {eyebrow}
                </p>
            )}
            <h2
                className="mt-4 font-display text-xl leading-[1.5] font-extrabold text-[var(--ink)] sm:text-2xl"
                style={{ textShadow: '3px 3px 0 var(--pixel-shadow)' }}
            >
                {title}
            </h2>
            {subtitle && <p className="mt-5 font-body text-xl leading-relaxed text-[var(--ink-light)]">{subtitle}</p>}
        </div>
    );
}
