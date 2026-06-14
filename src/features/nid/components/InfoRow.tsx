import type { ReactNode } from "react";

interface InfoRowProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <div className="flex items-start gap-2.5 min-w-0">
    <span
      className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5"
      aria-hidden="true"
    >
      {icon}
    </span>
    <div className="min-w-0 flex-1">
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">{label}</dt>
      <dd className="text-sm font-semibold text-foreground break-words leading-snug mt-0.5">{value}</dd>
    </div>
  </div>
);

export default InfoRow;
