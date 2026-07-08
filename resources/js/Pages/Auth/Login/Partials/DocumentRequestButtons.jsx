import { FileText, Plane } from "lucide-react";

const buttonConfig = [
    {
        type: "locator_slip",
        label: "Locator Slip",
        icon: FileText,
    },
    {
        type: "travel_order",
        label: "Travel Order",
        icon: Plane,
    },
];

const DocumentRequestButtons = ({
    onOpenDocumentRequest,
    buttonClassName,
    iconClassName,
    containerClassName,
}) => (
    <div className={containerClassName}>
        {buttonConfig.map(({ type, label, icon: Icon }) => (
            <button
                key={type}
                type="button"
                onClick={() => onOpenDocumentRequest(type)}
                className={buttonClassName}
            >
                <Icon className={iconClassName} />
                {label}
            </button>
        ))}
    </div>
);

export default DocumentRequestButtons;
