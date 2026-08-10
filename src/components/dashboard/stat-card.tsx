import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string;
  value: string;
  change?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="stat-card-hover rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {Icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
            <Icon size={16} />
          </span>
        )}
      </div>
      <div className="text-2xl font-extrabold tracking-tight">{value}</div>
      {change && (
        <div className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-emerald-500">
          {change} نسبت به ماه قبل
        </div>
      )}
    </div>
  );
}
