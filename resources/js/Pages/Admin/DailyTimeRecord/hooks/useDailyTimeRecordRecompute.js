import { useState } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import usePreservedPageScroll from "./usePreservedPageScroll";

const recomputeScrollKey = "dtr-recompute-scroll-top";

const useDailyTimeRecordRecompute = () => {
    const { rememberPageScroll, restorePageScroll } = usePreservedPageScroll({
        storageKey: recomputeScrollKey,
    });
    const [recomputeEmployee, setRecomputeEmployee] = useState(null);

    const handleUndoRecompute = (undo) => {
        if (!undo?.token || !undo?.employee_id) return;

        rememberPageScroll();

        router.post(
            route("dailytimerecord.recompute.undo", undo.employee_id),
            {
                token: undo.token,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success("Daily time record recompute undone.", {
                        duration: 3000,
                    });
                },
                onFinish: restorePageScroll,
            },
        );
    };

    const showRecomputeUndoToast = (undo) => {
        const toastId = `dtr-recompute-${undo.token}`;
        let secondsLeft = 8;
        let timer;

        const showToast = () => {
            toast.success("Daily time record recomputed.", {
                id: toastId,
                description: `Undo available for ${secondsLeft}s.`,
                duration: secondsLeft * 1000,
                action: {
                    label: "Undo",
                    onClick: () => {
                        clearInterval(timer);
                        toast.dismiss(toastId);
                        handleUndoRecompute(undo);
                    },
                },
            });
        };

        timer = setInterval(() => {
            secondsLeft -= 1;

            if (secondsLeft <= 0) {
                clearInterval(timer);
                return;
            }

            showToast();
        }, 1000);

        showToast();
    };

    const openRecomputeDialog = (employee) => {
        setRecomputeEmployee(employee);
    };

    const closeRecomputeDialog = () => {
        setRecomputeEmployee(null);
    };

    const handleRecomputeEmployee = ({ from, to }) => {
        if (!recomputeEmployee) return;

        rememberPageScroll();

        router.post(
            route("dailytimerecord.recompute", recomputeEmployee.id),
            {
                from,
                to,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    const undo = page.props.flash?.recomputeUndo;

                    if (!undo) return;

                    showRecomputeUndoToast(undo);
                    closeRecomputeDialog();
                },
                onFinish: restorePageScroll,
            },
        );
    };

    return {
        closeRecomputeDialog,
        handleRecomputeEmployee,
        openRecomputeDialog,
        recomputeEmployee,
    };
};

export default useDailyTimeRecordRecompute;
