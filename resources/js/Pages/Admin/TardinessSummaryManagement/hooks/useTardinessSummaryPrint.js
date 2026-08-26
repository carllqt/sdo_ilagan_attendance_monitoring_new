import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import documentTemplatePageStyle from "@/Components/Reports/documentTemplatePageStyle";

const useTardinessSummaryPrint = () => {
    const printRef = useRef();
    const printSummary = useReactToPrint({
        contentRef: printRef,
        documentTitle: "Tardiness_Summary",
        pageStyle: documentTemplatePageStyle,
    });

    const print = () => {
        printSummary();
    };

    return {
        print,
        printRef,
    };
};

export default useTardinessSummaryPrint;
