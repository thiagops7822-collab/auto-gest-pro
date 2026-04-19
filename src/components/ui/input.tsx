import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const isTextLike =
      !type ||
      type === "text" ||
      type === "search" ||
      type === "email" ||
      type === "url" ||
      type === "tel";

    // Habilita sugestões/autocompletar do teclado mobile para campos de texto.
    // Para campos não-texto (number, date, password, etc.) preserva o comportamento padrão.
    const mobileTextProps = isTextLike
      ? {
          autoComplete: props.autoComplete ?? "on",
          autoCorrect: (props as React.InputHTMLAttributes<HTMLInputElement>).autoCorrect ?? "on",
          autoCapitalize: props.autoCapitalize ?? "sentences",
          spellCheck: props.spellCheck ?? true,
          inputMode: props.inputMode ?? "text",
        }
      : {};

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...mobileTextProps}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
