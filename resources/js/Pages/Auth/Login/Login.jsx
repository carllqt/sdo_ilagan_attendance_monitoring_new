import { Head } from "@inertiajs/react";
import { useEffect } from "react";
import { Toaster, toast } from "sonner";

import TalaBackground from "@/Components/TalaBackground";

import DocumentRequestDialog from "./Partials/DocumentRequestDialog";
import DocumentRequestSuccessToast from "./Partials/DocumentRequestSuccessToast";
import DesktopBrandPanel from "./Partials/DesktopBrandPanel";
import LoginFormSection from "./Partials/LoginFormSection";
import useLoginPageForms from "./hooks/useLoginPageForms";
import {
    getSelectedStation,
    getStationItems,
    requestIcons,
    requestLabels,
} from "./util";

const Login = ({ status, canResetPassword, flash = {}, stations = [] }) => {
    const {
        showPassword,
        setShowPassword,
        requestModalType,
        loginForm,
        documentRequestForm,
    } = useLoginPageForms({ stations });

    const requestLabel =
        requestLabels[requestModalType] || requestLabels.locator_slip;
    const RequestTypeIcon =
        requestIcons[requestModalType] || requestIcons.locator_slip;
    const isLocatorSlip = requestModalType === "locator_slip";
    const stationItems = getStationItems(stations);
    const selectedStation = getSelectedStation(
        stationItems,
        documentRequestForm.data.station_id,
    );

    useEffect(() => {
        if (!flash.success) return;

        toast.custom(
            () => <DocumentRequestSuccessToast message={flash.success} />,
            {
                id: "document-request-success",
                duration: 4500,
            },
        );
    }, [flash.success]);

    return (
        <>
            <Head title="Log in" />
            <Toaster position="top-center" visibleToasts={1} gap={10} />

            <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#02062f] px-3 py-5 text-slate-900 sm:px-4 sm:py-8">
                <TalaBackground />

                <div className="relative z-10 grid w-full max-w-[390px] overflow-hidden rounded-[1.45rem] border border-white/20 bg-[linear-gradient(135deg,rgba(7,15,76,0.34),rgba(58,55,170,0.20))] shadow-[0_0_28px_rgba(167,139,250,0.18),0_24px_80px_rgba(2,6,47,0.48),inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-violet-200/10 backdrop-blur-[2px] sm:rounded-[1.7rem] lg:max-w-[1040px] lg:grid-cols-2">
                    <DesktopBrandPanel
                        onOpenDocumentRequest={documentRequestForm.open}
                    />
                    <LoginFormSection
                        status={status}
                        flash={flash}
                        canResetPassword={canResetPassword}
                        showPassword={showPassword}
                        onTogglePassword={() =>
                            setShowPassword((value) => !value)
                        }
                        loginForm={loginForm}
                        onOpenDocumentRequest={documentRequestForm.open}
                    />
                </div>
            </div>

            <DocumentRequestDialog
                requestModalType={requestModalType}
                requestLabel={requestLabel}
                RequestTypeIcon={RequestTypeIcon}
                isLocatorSlip={isLocatorSlip}
                stationItems={stationItems}
                selectedStation={selectedStation}
                documentRequestForm={documentRequestForm}
            />
        </>
    );
};

export default Login;
