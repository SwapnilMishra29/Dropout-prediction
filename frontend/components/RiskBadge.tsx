import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  showScore?: boolean;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function RiskBadge({ level, showScore = false, score = 0, size = 'md' }: RiskBadgeProps) {
  const riskColors: Record<string, { bg: string; text: string; border: string }> = {
    Low: { bg: 'bg-green-500/10', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
    Medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' },
    High: { bg: 'bg-orange-500/10', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
    Critical: { bg: 'bg-red-500/10', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const colors = riskColors[level];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold rounded-full border',
        colors.bg,
        colors.text,
        colors.border,
        sizeClasses[size]
      )}
    >
      <span className={cn('w-2 h-2 rounded-full', {
        'bg-green-500': level === 'Low',
        'bg-yellow-500': level === 'Medium',
        'bg-orange-500': level === 'High',
        'bg-red-500': level === 'Critical',
      })} />
      {level}
      {showScore && <span className="ml-1 opacity-75">({score}%)</span>}
    </span>
  );
}
