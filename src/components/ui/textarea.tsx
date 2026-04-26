import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const removeUppercaseClass = (className?: string) =>
  className
    ?.split(/\s+/)
    .filter(Boolean)
    .filter((token) => token !== "uppercase")
    .join(" ");

const syncUppercaseTextareaValue = (element: HTMLTextAreaElement, nextValue: string) => {
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;

  valueSetter?.call(element, nextValue);
  element.dispatchEvent(new Event("input", { bubbles: true }));
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, autoCapitalize, onBlur, ...props }, ref) => {
  const wantsUppercase = className?.split(/\s+/).includes("uppercase") ?? false;

  const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    if (wantsUppercase) {
      const nextValue = event.currentTarget.value.toUpperCase();

      if (nextValue !== event.currentTarget.value) {
        syncUppercaseTextareaValue(event.currentTarget, nextValue);
      }
    }

    onBlur?.(event);
  };

  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        wantsUppercase ? removeUppercaseClass(className) : className,
      )}
      ref={ref}
      {...props}
      autoComplete={props.autoComplete ?? "on"}
      autoCorrect={(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>).autoCorrect ?? "on"}
      autoCapitalize={autoCapitalize ?? (wantsUppercase ? "characters" : "sentences")}
      spellCheck={props.spellCheck ?? true}
      onBlur={handleBlur}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
