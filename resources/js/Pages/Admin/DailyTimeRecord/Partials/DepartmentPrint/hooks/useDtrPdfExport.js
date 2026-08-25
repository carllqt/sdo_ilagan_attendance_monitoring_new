import { useState } from "react";
import { useReactToPrint } from "react-to-print";

const legalDtrPageStyle = `
    @page { size: 8.5in 13in; margin: 0; }
    @media print {
        html, body {
            width: 8.5in !important;
            min-height: 13in !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        #dtr-print-content {
            position: static !important;
            top: auto !important;
            left: auto !important;
            width: 8.5in !important;
            min-height: 13in !important;
            box-sizing: border-box;
            padding: 0.5in;
            -webkit-text-size-adjust: 100% !important;
            text-size-adjust: 100% !important;
        }
        #dtr-print-content * {
            -webkit-text-size-adjust: 100% !important;
            text-size-adjust: 100% !important;
        }
    }
`;

const useDtrPdfExport = ({ onClose, printContainerRef }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const printDtr = useReactToPrint({
        contentRef: printContainerRef,
        documentTitle: "Daily_Time_Record",
        pageStyle: legalDtrPageStyle,
    });

    const handleDownloadPDF = async () => {
        setIsGenerating(true);
        printDtr();
        setIsGenerating(false);
        onClose();
    };

    return {
        handleDownloadPDF,
        isGenerating,
    };
};

export default useDtrPdfExport;
