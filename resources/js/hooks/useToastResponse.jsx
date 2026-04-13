import { useEffect, useRef } from "react";
import { usePage } from "@inertiajs/react";
import { toast } from "sonner";

export default function useToastResponse() {
    const flash = usePage().props.flash;
    const shown = useRef(false);

    useEffect(() => {
        if (!flash) return;

        if (flash.success && !shown.current) {
            toast.success(flash.success, {
                description: "Operation successful!",
                duration: 3000,
                closeButton: true,
            });

            shown.current = true;
        }

        if (flash.error && !shown.current) {
            toast.error(flash.error, {
                description: "Operation failed!",
                duration: 3000,
                closeButton: true,
            });

            shown.current = true;
        }

        // reset AFTER route change
        return () => {
            shown.current = false;
        };
    }, [flash?.success, flash?.error]);
}
