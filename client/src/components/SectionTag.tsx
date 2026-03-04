interface SectionTagProps {
  children: React.ReactNode;
}

export default function SectionTag({ children }: SectionTagProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dark-slate-light border border-gold/20 text-gold text-[10px] font-mono uppercase tracking-[0.2em] mb-6" data-testid="section-tag">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
      </span>
      {children}
    </div>
  );
}
