import { router, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";

import {
    defaultDocumentRequestData,
    validateDocumentRequestData,
} from "../util";

const modalQueryValues = {
    locator_slip: "locator-slip",
    travel_order: "travel-order",
};

const useLoginPageForms = ({ documentRequestModal = null, stations = [] }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [requestModalType, setRequestModalType] = useState(
        documentRequestModal,
    );
    const [requestPreviewOpen, setRequestPreviewOpen] = useState(false);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const {
        data: requestData,
        setData: setRequestData,
        post: postRequest,
        processing: requestProcessing,
        errors: requestErrors,
        reset: resetRequest,
        clearErrors: clearRequestErrors,
        setError: setRequestError,
    } = useForm({
        ...defaultDocumentRequestData,
        request_type: documentRequestModal || "",
        station_id: stations[0]?.id || "",
    });

    useEffect(() => {
        setRequestPreviewOpen(false);
        setRequestModalType(documentRequestModal);
        clearRequestErrors();

        if (documentRequestModal) {
            setRequestData({
                ...defaultDocumentRequestData,
                request_type: documentRequestModal,
                station_id: stations[0]?.id || "",
            });
            return;
        }

        resetRequest();
    }, [documentRequestModal]);

    const submitLogin = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    const openDocumentRequest = (type) => {
        const modal = modalQueryValues[type];

        if (!modal) return;

        const params = new URLSearchParams(window.location.search);
        params.set("modal", modal);

        router.get(route("login"), Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const closeDocumentRequest = () => {
        const params = new URLSearchParams(window.location.search);
        params.delete("modal");

        router.get(route("login"), Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const submitDocumentRequest = (e) => {
        e.preventDefault();

        clearRequestErrors();
        const validationErrors = validateDocumentRequestData(requestData);

        if (Object.keys(validationErrors).length > 0) {
            setRequestError(validationErrors);
            return;
        }

        setRequestPreviewOpen(true);
    };

    const saveDocumentRequest = () => {
        postRequest("/document-requests", {
            preserveScroll: true,
            onSuccess: closeDocumentRequest,
            onError: () => setRequestPreviewOpen(false),
        });
    };

    return {
        showPassword,
        setShowPassword,
        requestModalType,
        loginForm: {
            data,
            setData,
            processing,
            errors,
            submit: submitLogin,
        },
        documentRequestForm: {
            data: requestData,
            setData: setRequestData,
            processing: requestProcessing,
            errors: requestErrors,
            open: openDocumentRequest,
            close: closeDocumentRequest,
            previewOpen: requestPreviewOpen,
            backToForm: () => setRequestPreviewOpen(false),
            save: saveDocumentRequest,
            submit: submitDocumentRequest,
        },
    };
};

export default useLoginPageForms;
