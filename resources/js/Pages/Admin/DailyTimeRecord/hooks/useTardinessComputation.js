import React from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import { loadTardinessAnimationData } from "../utils";

const useTardinessComputation = ({
    currentMonth,
    currentYear,
    tardinessStatus,
}) => {
    const [tardinessComputing, setTardinessComputing] = React.useState(
        Boolean(tardinessStatus?.needs_computation),
    );
    const [tardinessAnimationData, setTardinessAnimationData] =
        React.useState(null);
    const computeRequestRef = React.useRef(null);

    React.useEffect(() => {
        const needsComputation = Boolean(tardinessStatus?.needs_computation);
        const computeMonth = tardinessStatus?.month || currentMonth;
        const computeYear = tardinessStatus?.year || currentYear;
        const computeKey = `${computeYear}-${computeMonth}`;

        if (!needsComputation) {
            computeRequestRef.current = null;
            setTardinessComputing(false);
            return;
        }

        setTardinessComputing(true);
        loadTardinessAnimationData()
            .then((animationData) => {
                setTardinessAnimationData(animationData);
            })
            .catch(() => {
                setTardinessAnimationData(null);
            });

        if (computeRequestRef.current === computeKey) return;

        computeRequestRef.current = computeKey;

        const csrfToken =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") || "";

        axios
            .post(
                route("daily-time-record.tardiness.compute", undefined, false),
                {
                    _token: csrfToken,
                },
                {
                    params: {
                        month: computeMonth,
                        year: computeYear,
                    },
                    headers: {
                        "X-CSRF-TOKEN": csrfToken,
                    },
                },
            )
            .catch(() => {
                computeRequestRef.current = null;
                setTardinessComputing(false);
            })
            .finally(() => {
                router.reload({
                    only: ["time_record", "tardiness_status"],
                    preserveScroll: true,
                    preserveState: true,
                });
            });
    }, [
        currentMonth,
        currentYear,
        tardinessStatus?.month,
        tardinessStatus?.needs_computation,
        tardinessStatus?.year,
    ]);

    React.useEffect(() => {
        if (!tardinessComputing) return;

        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = "";
        };

        const handleDocumentClick = (event) => {
            const link = event.target.closest?.("a[href]");

            if (!link) return;

            event.preventDefault();
            event.stopPropagation();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        document.addEventListener("click", handleDocumentClick, true);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            document.removeEventListener("click", handleDocumentClick, true);
        };
    }, [tardinessComputing]);

    return {
        tardinessAnimationData,
        tardinessComputing,
    };
};

export default useTardinessComputation;
