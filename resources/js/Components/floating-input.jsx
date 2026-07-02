import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function FloatingInput({
    label,
    icon: Icon,
    name,
    value,
    onChange,
    onKeyDown,
    onFocus,
    onBlur,
    type = "text",
    readOnly = false,
    disabled = false,
    inputClassName = "",
    placeholder = " ",
    variant = "default",
}) {
    const [isFocused, setIsFocused] = useState(false);
    const isFloated = isFocused || Boolean(value);
    const labelOffsetClasses = Icon ? "left-8" : "left-3";
    const isGlass = variant === "glass";
    const wrapperClassName = isGlass
        ? "relative flex items-center rounded-xl bg-white/[0.12] px-3 py-1.5 text-white backdrop-blur transition focus-within:bg-white/[0.16]"
        : "relative flex items-center rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-1.5 shadow-sm transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100";
    const iconClassName = isGlass
        ? "mr-2 h-4 w-4 text-white/75"
        : "mr-2 h-4 w-4 text-slate-400";
    const placeholderClassName =
        placeholder === " "
            ? "placeholder-transparent"
            : isFocused
              ? isGlass
                  ? "placeholder:text-white/45"
                  : "placeholder:text-slate-400"
              : "placeholder-transparent";
    const inputTextClassName = isGlass
        ? `text-white disabled:text-white/45 ${placeholderClassName}`
        : `text-slate-700 disabled:text-slate-400 ${placeholderClassName}`;
    const labelClassName = isGlass
        ? isFloated
            ? "text-[11px] font-semibold text-white"
            : "text-sm text-white/70"
        : isFloated
          ? "text-[11px] font-medium text-blue-600"
          : "text-sm text-slate-400";
    const labelBgClassName = isGlass
        ? "bg-transparent px-1 drop-shadow-sm"
        : `bg-slate-50 px-1 ${isFocused ? "bg-white" : ""}`;

    return (
        <div className="relative w-full">
            <div className={wrapperClassName}>
                {Icon && <Icon className={iconClassName} />}

                <Input
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onKeyDown={(event) => {
                        onKeyDown?.(event);

                        if (
                            event.key === "Enter" &&
                            !String(event.currentTarget.value || "").trim()
                        ) {
                            event.currentTarget.blur();
                            setIsFocused(false);
                        }
                    }}
                    onFocus={(event) => {
                        setIsFocused(true);
                        onFocus?.(event);
                    }}
                    onBlur={(event) => {
                        setIsFocused(false);
                        onBlur?.(event);
                    }}
                    readOnly={readOnly}
                    disabled={disabled}
                    placeholder={placeholder}
                    className={`peer h-6 min-w-0 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 ${inputTextClassName} ${inputClassName}`}
                />

                <label
                    htmlFor={name}
                    className={`absolute transition-all pointer-events-none
                        ${labelOffsetClasses}
                        ${
                            isFloated
                                ? "-top-2 translate-y-0"
                                : "top-1/2 -translate-y-1/2"
                        }
                        ${labelClassName} ${labelBgClassName}`}
                >
                    {label}
                </label>
            </div>
        </div>
    );
}

