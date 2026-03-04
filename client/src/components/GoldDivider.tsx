export default function GoldDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-2 ${className}`}>
      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent flex-1 max-w-[200px]" />
      <div className="w-1.5 h-1.5 rotate-45 bg-gold/60" />
      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent flex-1 max-w-[200px]" />
    </div>
  );
}
