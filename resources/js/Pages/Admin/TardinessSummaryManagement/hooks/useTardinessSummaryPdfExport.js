import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

const useTardinessSummaryPdfExport = () => {
    const pdfRef = useRef();
    const printSummary = useReactToPrint({
        contentRef: pdfRef,
        documentTitle: "Tardiness_Summary",
        pageStyle: "@page { size: letter portrait; margin: 0.5in; }",
    });

    const downloadPDF = ({ selectedMonth, selectedYear }) => {
        printSummary();
    };

    return {
        downloadPDF,
        pdfRef,
    };
};

export default useTardinessSummaryPdfExport;
