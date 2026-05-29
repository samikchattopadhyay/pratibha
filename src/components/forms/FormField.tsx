import { InputHTMLAttributes, ReactNode } from "react";
import FormError from "./FormError";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  children?: ReactNode;
}

export default function FormField({
  label,
  error,
  helperText,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">
        {label}
      </label>
      <input
        className={`w-full font-sans text-base bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 text-charcoal focus:outline-none focus:border-terracotta transition-colors ${
          error ? "border-red-300 focus:border-red-400" : ""
        } ${className || ""}`}
        {...props}
      />
      {error && <FormError error={error} />}
      {helperText && !error && (
        <p className="text-xs text-charcoal/60 font-sans">{helperText}</p>
      )}
    </div>
  );
}
