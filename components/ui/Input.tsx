import { cn } from "@/components/ui/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  placeholder,
  error,
  type = "text",
  value,
  onChange,
  disabled,
  className,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="px-1 text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "h-14 w-full rounded-2xl bg-slate-100/80 px-5 text-base font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50",
          error && "bg-red-50 focus:ring-red-500/20",
          className,
        )}
        {...props}
      />
      {error && <p className="px-1 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}

export default Input;
