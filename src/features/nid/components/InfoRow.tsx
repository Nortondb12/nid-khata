import type { ReactNode } from "react";

interface InfoRowProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <div className="flex items-start gap-2">
    <span className="text-primary mt-0.5 shrink-0" aria-hidden="true">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground break-words">{value}</p>
    </div>
  </div>
);

export default InfoRow;
