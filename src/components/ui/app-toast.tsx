import * as React from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type AppToastType = "success" | "error" | "warning" | "info";

export interface AppToastOptions {
  title?: string;
  description?: string;
  type?: AppToastType;
  duration?: number; // ms, default 5000; 0 = sticky
}

interface AppToast extends Required<Omit<AppToastOptions, "title" | "description">> {
  id: string;
  title?: string;
  description?: string;
}

interface ToastCtx {
  toast: (opts: AppToastOptions | string) => string;
  dismiss: (id?: string) => void;
}

const Ctx = React.createContext<ToastCtx | null>(null);

const isMobile = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;

const variantStyles: Record<AppToastType, { border: string; icon: string; Icon: React.ComponentType<{ className?: string }> }> = {
  success: { border: "border-l-primary", icon: "text-primary", Icon: CheckCircle2 },
  error: { border: "border-l-destructive", icon: "text-destructive", Icon: XCircle },
  warning: { border: "border-l-accent", icon: "text-accent", Icon: AlertTriangle },
  info: { border: "border-l-muted-foreground", icon: "text-muted-foreground", Icon: Info },
};

let idSeq = 0;
const nextId = () => `t_${Date.now()}_${++idSeq}`;

export const AppToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<AppToast[]>([]);
  const [mobile, setMobile] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const handler = () => setMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const dismiss = React.useCallback((id?: string) => {
    setToasts((ts) => (id ? ts.filter((t) => t.id !== id) : []));
  }, []);

  const toast = React.useCallback((opts: AppToastOptions | string) => {
    const o: AppToastOptions = typeof opts === "string" ? { title: opts } : opts;
    const item: AppToast = {
      id: nextId(),
      title: o.title,
      description: o.description,
      type: o.type ?? "info",
      duration: o.duration ?? 5000,
    };
    setToasts((ts) => [...ts, item]);
    return item.id;
  }, []);

  const value = React.useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  const container = (
    <div
      aria-live="polite"
      aria-atomic="false"
      className={cn(
        "pointer-events-none fixed z-[100] flex flex-col gap-3 p-4 w-full max-w-sm",
        mobile
          ? "bottom-0 left-1/2 -translate-x-1/2 items-center"
          : "top-0 right-0 items-end",
      )}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} mobile={mobile} />
      ))}
    </div>
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {typeof document !== "undefined" && createPortal(container, document.body)}
    </Ctx.Provider>
  );
};

const ToastItem: React.FC<{ toast: AppToast; onDismiss: () => void; mobile: boolean }> = ({
  toast,
  onDismiss,
  mobile,
}) => {
  const { Icon, border, icon } = variantStyles[toast.type];
  const [entered, setEntered] = React.useState(false);
  const [leaving, setLeaving] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const startRef = React.useRef<number>(performance.now());
  const elapsedRef = React.useRef(0);
  const [progress, setProgress] = React.useState(100);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const close = React.useCallback(() => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(onDismiss, 260);
  }, [leaving, onDismiss]);

  React.useEffect(() => {
    if (toast.duration <= 0) return;
    startRef.current = performance.now();
    const tick = (now: number) => {
      if (!paused) {
        const total = elapsedRef.current + (now - startRef.current);
        const pct = Math.max(0, 100 - (total / toast.duration) * 100);
        setProgress(pct);
        if (total >= toast.duration) {
          close();
          return;
        }
      } else {
        startRef.current = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, toast.duration]);

  const handleMouseEnter = () => {
    elapsedRef.current += performance.now() - startRef.current;
    setPaused(true);
  };
  const handleMouseLeave = () => {
    startRef.current = performance.now();
    setPaused(false);
  };

  const enterFrom = mobile ? "translate-y-4" : "translate-x-4";
  const leaveTo = mobile ? "translate-y-2" : "translate-x-4";

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "pointer-events-auto relative w-full overflow-hidden rounded-2xl border border-border border-l-4 bg-card text-card-foreground",
        "shadow-[var(--shadow-elevated)] transition-all duration-300 ease-out will-change-transform",
        border,
        entered && !leaving
          ? "opacity-100 scale-100 translate-x-0 translate-y-0"
          : cn("opacity-0 scale-95", leaving ? leaveTo : enterFrom),
      )}
    >
      <div className="flex items-start gap-3 p-4 pr-10">
        <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", icon)} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          {toast.title && (
            <p className="text-sm font-semibold leading-snug text-foreground">{toast.title}</p>
          )}
          {toast.description && (
            <p className={cn("text-sm text-muted-foreground leading-snug", toast.title && "mt-0.5")}>
              {toast.description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="বন্ধ করুন"
          className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/60">
          <div
            className={cn("h-full transition-[width] ease-linear", icon.replace("text-", "bg-"))}
            style={{ width: `${progress}%`, transitionDuration: paused ? "0ms" : "100ms" }}
          />
        </div>
      )}
    </div>
  );
};

export function useAppToast(): ToastCtx {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useAppToast must be used within <AppToastProvider>");
  return ctx;
}
