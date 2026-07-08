import InputError from "@/Components/InputError";
import FloatingInput from "@/Components/floating-input";

export const RequestTextField = ({
    id,
    label,
    icon: Icon,
    type = "text",
    value,
    error,
    onChange,
}) => (
    <div>
        <FloatingInput
            label={label}
            icon={Icon}
            name={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
        <InputError message={error} className="mt-2" />
    </div>
);

export const RequestDropdownField = ({
    label,
    icon: Icon,
    error,
    value,
    children,
}) => (
    <div>
        <div className="relative">
            <FloatingInput
                label={label}
                icon={Icon}
                value={value}
                readOnly
                onChange={() => {}}
                inputClassName="truncate pr-12"
            />
            <div className="absolute right-2 top-0 flex h-full items-center">
                {children}
            </div>
        </div>
        <InputError message={error} className="mt-2" />
    </div>
);
