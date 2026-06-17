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
            route("daily-time-record.recompute.undo", undo.employee_id),
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

    const employeeDisplayName = (employee) => {
        const name = [
            employee?.first_name,
            employee?.middle_name,
            employee?.last_name,
        ]
            .filter(Boolean)
            .join(" ");

        return employee?.full_name || name || "Employee";
    };

    const showRecomputeUndoToast = (undo, employee) => {
        const toastId = `dtr-recompute-${undo.token || Date.now()}`;
        let secondsLeft = 8;
        let timer;
        const attendanceCount = Number(undo.attendance_count || 0);
        const hasUndo = Boolean(undo.token);
        const employeeName = employeeDisplayName(employee);
        const description =
            attendanceCount > 0
                ? `${employeeName} recomputed. Undo available for ${secondsLeft}s.`
                : `No attendance rows found for ${employeeName}.`;

        const showToast = () => {
            toast.success("Daily time record recomputed.", {
                id: toastId,
                description:
                    attendanceCount > 0
                        ? description.replace(
                              /Undo available for \d+s\./,
                              `Undo available for ${secondsLeft}s.`,
                          )
                        : description,
                duration: secondsLeft * 1000,
                action: hasUndo
                    ? {
                          label: "Undo",
                          onClick: () => {
                              clearInterval(timer);
                              toast.dismiss(toastId);
                              handleUndoRecompute(undo);
                          },
                      }
                    : undefined,
            });
        };

        if (hasUndo) {
            timer = setInterval(() => {
                secondsLeft -= 1;

                if (secondsLeft <= 0) {
                    clearInterval(timer);
                    return;
                }

                showToast();
            }, 1000);
        }

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
            route("daily-time-record.recompute", recomputeEmployee.id),
            {
                from,
                to,
            },
            {
                preserveScroll: true,
                preserveState: false,
                onSuccess: (page) => {
                    const undo = page.props.flash?.recomputeUndo;

                    if (!undo) return;

                    showRecomputeUndoToast(undo, recomputeEmployee);
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
