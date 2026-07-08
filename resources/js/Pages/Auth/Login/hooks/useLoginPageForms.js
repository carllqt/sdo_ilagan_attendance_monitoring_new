import { useForm } from "@inertiajs/react";
import { useState } from "react";

import { defaultDocumentRequestData } from "../util";

const useLoginPageForms = ({ stations = [] }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [requestModalType, setRequestModalType] = useState(null);

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
    } = useForm(defaultDocumentRequestData);

    const submitLogin = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    const openDocumentRequest = (type) => {
        clearRequestErrors();
        setRequestData({
            ...defaultDocumentRequestData,
            request_type: type,
            station_id: stations[0]?.id || "",
        });
        setRequestModalType(type);
    };

    const closeDocumentRequest = () => {
        setRequestModalType(null);
        resetRequest();
        clearRequestErrors();
    };

    const submitDocumentRequest = (e) => {
        e.preventDefault();

        postRequest("/document-requests", {
            preserveScroll: true,
            onSuccess: closeDocumentRequest,
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
            submit: submitDocumentRequest,
        },
    };
};

export default useLoginPageForms;
