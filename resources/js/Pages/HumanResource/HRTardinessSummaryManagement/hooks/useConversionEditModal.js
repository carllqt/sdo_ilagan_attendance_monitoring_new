import { useEffect } from "react";
import { router, useForm } from "@inertiajs/react";

import { clearEditConversionModalParams } from "../utils";

const useConversionEditModal = (editConversionModal = null) => {
    const { data, errors, processing, put, reset, setData, clearErrors } =
        useForm({
            equivalent_days: "",
        });

    useEffect(() => {
        if (!editConversionModal) {
            reset();
            clearErrors();
            return;
        }

        setData(
            "equivalent_days",
            String(editConversionModal.equivalent_days ?? ""),
        );
    }, [clearErrors, editConversionModal, reset, setData]);

    const openEditModal = (item, valueKey) => {
        const query = new URLSearchParams(window.location.search);

        query.set("modal", "edit-conversion");
        query.set("conversion_type", valueKey);
        query.set("conversion_id", item.id);

        router.get(route("tardiness-conversion"), Object.fromEntries(query), {
            only: ["editConversionModal"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const closeEditModal = () => {
        const query = clearEditConversionModalParams(
            new URLSearchParams(window.location.search),
        );

        router.get(route("tardiness-conversion"), Object.fromEntries(query), {
            only: [
                "conversionHours",
                "conversionMinutes",
                "editConversionModal",
            ],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleUpdateConversion = (event) => {
        event.preventDefault();

        if (!editConversionModal) {
            return;
        }

        const query = Object.fromEntries(
            new URLSearchParams(window.location.search),
        );

        put(
            route("tardiness-conversions.update", {
                type: editConversionModal.type,
                id: editConversionModal.id,
                ...query,
            }),
            {
                preserveScroll: true,
                onError: () => {},
            },
        );
    };

    return {
        closeEditModal,
        data,
        errors,
        handleUpdateConversion,
        openEditModal,
        processing,
        setData,
    };
};

export default useConversionEditModal;
