import { useRef } from "react";
import html2pdf from "html2pdf.js";
import { getPrintSummaryFilename } from "../utils";

const useTardinessSummaryPdfExport = () => {
    const pdfRef = useRef();

    const downloadPDF = ({ selectedMonth, selectedYear }) => {
        const element = pdfRef.current;

        html2pdf()
            .set({
                margin: 0.5,
                filename: getPrintSummaryFilename({
                    selectedMonth,
                    selectedYear,
                }),
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
        downloadPDF,
        pdfRef,
    };
};

export default useTardinessSummaryPdfExport;
