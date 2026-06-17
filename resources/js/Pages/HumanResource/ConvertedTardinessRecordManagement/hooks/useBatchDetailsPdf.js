import { useMemo, useRef } from "react";
import html2pdf from "html2pdf.js";

import { getEmployeeName } from "@/lib/utils";
import { getBatchPdfFilename, toBatchReportRecords } from "../utils";

const useBatchDetailsPdf = (batch) => {
    const pdfRef = useRef(null);
    const reportRecords = useMemo(
        () => toBatchReportRecords(batch, getEmployeeName),
        [batch],
    );

    const handlePrintPDF = () => {
        const element = pdfRef.current;

        if (!element || reportRecords.length === 0) {
            return;
        }

        html2pdf()
            .set({
                margin: 0.5,
                filename: getBatchPdfFilename(batch?.id),
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: {
                    unit: "in",
                    format: "letter",
                    orientation: "portrait",
                },
            })
            .from(element)
            .save();
    };

    return {
        handlePrintPDF,
        pdfRef,
        reportRecords,
    };
};

export default useBatchDetailsPdf;
