import { ThemeToggle } from "@workspace/ui/components/theme-toggle";
import { cn } from "@workspace/ui/lib/utils";

export const WidgetHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <header className={cn(
      "relative bg-gradient-to-b from-primary to-[#0b63f3] p-4 text-primary-foreground",
      className,
    )}>
      {children}
      <div className="absolute right-2 top-2">
        <ThemeToggle />
      </div>
    </header>
  );
};
