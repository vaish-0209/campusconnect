import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  href?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-primary",
  href,
}: StatCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-secondary/50 ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <span
            className={`text-sm font-medium ${
              changeType === "positive"
                ? "text-green-500"
                : changeType === "negative"
                ? "text-red-500"
                : "text-muted-foreground"
            }`}
          >
            {change}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="glass-card rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-all group cursor-pointer block">
        {content}
      </Link>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-all group">
      {content}
    </div>
  );
}
