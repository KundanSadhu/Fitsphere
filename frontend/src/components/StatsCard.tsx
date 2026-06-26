import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit: string;
  colorClass?: string;
  bgClass?: string;
}

export const StatsCard = ({
  icon: Icon,
  label,
  value,
  unit,
  colorClass = 'text-theme',
}: StatsCardProps) => {
  return (
    <div id={`stats-card-${label.toLowerCase().replace(/\s+/g, '-')}`} className="flex flex-col p-4 rounded-2xl bg-card border-2 border-theme shadow-brutal transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none select-none text-left">
      <div className="flex items-center justify-between gap-1 mb-2">
        <span className="text-[10px] font-black text-theme-muted tracking-wide uppercase">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-primary border border-theme flex items-center justify-center shadow-brutal-sm">
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="flex items-baseline gap-1 mt-1">
        <span className={`text-2xl font-black tracking-tight ${colorClass}`}>{value}</span>
        <span className="text-xs font-bold text-theme-muted">{unit}</span>
      </div>
    </div>
  );
};
