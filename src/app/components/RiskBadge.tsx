interface RiskBadgeProps {
  level: 'safe' | 'moderate' | 'high' | 'critical';
  size?: 'sm' | 'md' | 'lg';
}

export function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  const colors = {
    safe: 'bg-[#10B981] text-white',
    moderate: 'bg-[#f59e0b] text-white',
    high: 'bg-[#f97316] text-white',
    critical: 'bg-[#ef4444] text-white',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const labels = {
    safe: 'Safe',
    moderate: 'Moderate Risk',
    high: 'High Risk',
    critical: 'Critical Risk',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${colors[level]} ${sizes[size]}`}>
      {labels[level]}
    </span>
  );
}
