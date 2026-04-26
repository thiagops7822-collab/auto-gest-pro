import * as React from "react";

import { cn } from "@/lib/utils";

const removeUppercaseClass = (className?: string) =>
  className
    ?.split(/\s+/)
    .filter(Boolean)
    .filter((token) => token !== "uppercase")
    .join(" ");

const syncUppercaseInputValue = (element: HTMLInputElement, nextValue: string) => {
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;

  valueSetter?.call(element, nextValue);
  element.dispatchEvent(new Event("input", { bubbles: true }));
};

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, autoCapitalize, onBlur, ...props }, ref) => {
    const wantsUppercase = className?.split(/\s+/).includes("uppercase") ?? false;
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
          autoCapitalize: autoCapitalize ?? (wantsUppercase ? "characters" : "sentences"),
          spellCheck: props.spellCheck ?? true,
          inputMode: props.inputMode ?? "text",
        }
      : {};

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      if (wantsUppercase) {
        const nextValue = event.currentTarget.value.toUpperCase();

        if (nextValue !== event.currentTarget.value) {
          syncUppercaseInputValue(event.currentTarget, nextValue);
        }
      }

      onBlur?.(event);
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          wantsUppercase ? removeUppercaseClass(className) : className,
        )}
        ref={ref}
        {...props}
        {...mobileTextProps}
        onBlur={handleBlur}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
