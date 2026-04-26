import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "purple" | "teal" | "coral" | "green" | "gray";
  className?: string;
}

export default function Badge({ children, variant = "purple", className }: BadgeProps) {
  const variants = {
    purple: "bg-primary-100 text-primary-700",
    teal: "bg-teal-100 text-teal-700",
    coral: "bg-coral-100 text-coral-700",
    green: "bg-green-100 text-green-700",
    gray: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
