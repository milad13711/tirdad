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
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon size={15} />
          </span>
        )}
      </div>
      <div className="text-2xl font-extrabold">{value}</div>
      {change && <div className="mt-1 text-xs text-emerald-500">{change} نسبت به ماه قبل</div>}
    </div>
  );
}
