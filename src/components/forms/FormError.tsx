import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  error?: string;
}

export default function FormError({ error }: FormErrorProps) {
  if (!error) return null;

  return (
    <div className="text-red-600 text-sm font-sans flex items-start gap-2 mt-1">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{error}</span>
    </div>
  );
}
