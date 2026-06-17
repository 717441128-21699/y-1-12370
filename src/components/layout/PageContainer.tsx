import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function PageContainer({
  children,
  className,
  title,
  subtitle,
  action,
}: PageContainerProps) {
  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
          <div>
            {title && (
              <h1 className="text-xl font-serif font-bold text-navy-50">{title}</h1>
            )}
            {subtitle && <p className="text-sm text-navy-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  );
}
