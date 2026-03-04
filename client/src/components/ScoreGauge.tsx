interface ScoreGaugeProps {
  score: number;
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const percentage = (score - 300) / (850 - 300);
  const strokeDash = percentage * 283;
  return (
    <div className="relative w-48 h-48 mx-auto" data-testid="score-gauge">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="96" cy="96" r="45" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
        <circle cx="96" cy="96" r="45" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="283"
          style={{ strokeDashoffset: 283 - strokeDash }} className="text-gold transition-all duration-1000 ease-out" strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-display tracking-wide text-white leading-none">{score}</span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mt-1">FICO® 8</span>
      </div>
    </div>
  );
}
