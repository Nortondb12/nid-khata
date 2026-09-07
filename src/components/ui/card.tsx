import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "group relative flex flex-col overflow-hidden rounded-3xl border border-border/40 bg-card/80 text-card-foreground shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/20 dark:bg-card/60",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardSpotlight = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100",
        className,
      )}
      {...props}
    >
      <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-primary/10 blur-3xl" />
    </div>
  ),
);
CardSpotlight.displayName = "CardSpotlight";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative z-10 flex flex-col space-y-1.5 p-6 pb-4", className)}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "relative z-10 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-xl font-bold leading-tight tracking-tight text-transparent transition-colors duration-300 group-hover:from-primary group-hover:to-primary/70 sm:text-2xl",
        className,
      )}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("relative z-10 text-sm leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative z-10 flex flex-1 flex-col gap-3 px-6 pb-6 pt-0", className)}
      {...props}
    />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative z-10 mt-auto flex items-center gap-3 border-t border-border/40 bg-gradient-to-r from-muted/50 to-transparent px-6 py-4",
        className,
      )}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardSpotlight };