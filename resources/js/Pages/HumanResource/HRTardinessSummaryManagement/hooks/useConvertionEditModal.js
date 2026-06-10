import { useEffect } from "react";
import { router, useForm } from "@inertiajs/react";

import { clearEditConvertionModalParams } from "../utils";

const useConvertionEditModal = (editConvertionModal = null) => {
    const { data, errors, processing, put, reset, setData, clearErrors } =
        useForm({
            equivalent_days: "",
        });

    useEffect(() => {
        if (!editConvertionModal) {
            reset();
            clearErrors();
            return;
        }

        setData(
            "equivalent_days",
            String(editConvertionModal.equivalent_days ?? ""),
        );
    }, [clearErrors, editConvertionModal, reset, setData]);

    const openEditModal = (item, valueKey) => {
        const query = new URLSearchParams(window.location.search);

        query.set("modal", "edit-convertion");
        query.set("conversion_type", valueKey);
        query.set("conversion_id", item.id);

        router.get(route("tardinessconvertion"), Object.fromEntries(query), {
            only: ["editConvertionModal"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const closeEditModal = () => {
        const query = clearEditConvertionModalParams(
            new URLSearchParams(window.location.search),
        );

        router.get(route("tardinessconvertion"), Object.fromEntries(query), {
            only: [
                "conversionHours",
                "conversionMinutes",
                "editConvertionModal",
            ],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleUpdateConvertion = (event) => {
        event.preventDefault();

        if (!editConvertionModal) {
            return;
        }

        const query = Object.fromEntries(
            new URLSearchParams(window.location.search),
        );

        put(
            route("tardiness-convertions.update", {
                type: editConvertionModal.type,
                id: editConvertionModal.id,
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
        handleUpdateConvertion,
        openEditModal,
        processing,
        setData,
    };
};

export default useConvertionEditModal;
