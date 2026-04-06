import * as React from "react";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

/**
 * Formats a raw numeric string (cents) into Brazilian currency format: R$ 0.000,00
 */
function formatToCurrency(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '');
  if (!digits) return '';
  const cents = parseInt(digits, 10);
  const reais = (cents / 100).toFixed(2);
  const [intPart, decPart] = reais.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${formattedInt},${decPart}`;
}

/**
 * Parses a formatted currency string back to a plain numeric string (for form state)
 */
export function parseCurrencyToNumber(formatted: string): number {
  const digits = formatted.replace(/\D/g, '');
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, placeholder = "R$ 0,00", className, disabled, readOnly }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '');
      if (!raw) {
        onChange('');
        return;
      }
      onChange(formatToCurrency(raw));
    };

    // If value is a plain number (from edit), convert it to formatted
    const displayValue = React.useMemo(() => {
      if (!value) return '';
      // Already formatted
      if (value.includes('R$')) return value;
      // Plain number string - convert to formatted
      const num = parseFloat(value);
      if (isNaN(num)) return '';
      const cents = Math.round(num * 100).toString();
      return formatToCurrency(cents);
    }, [value]);

    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput, formatToCurrency };
