import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
}

const variants = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-300",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface LinkButtonProps {
  href: string;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  className?: string;
}

export function LinkButton({
  href,
  variant = "primary",
  children,
  className = "",
}: LinkButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-indigo-600 text-white hover:bg-indigo-500"
      : "border border-slate-200 text-slate-700 hover:bg-slate-50";

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${styles} ${className}`}
    >
      {children}
    </Link>
  );
}
