import { useState } from "react";
import { useReactToPrint } from "react-to-print";

const useDtrPrint = ({ onClose, printContainerRef }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const printDtr = useReactToPrint({
        contentRef: printContainerRef,
        documentTitle: "Daily_Time_Record",
        onAfterPrint: () => {
            setIsGenerating(false);
            onClose();
        },
        onPrintError: () => setIsGenerating(false),
    });

    const handlePrint = async () => {
        setIsGenerating(true);
        printDtr();
    };

    return {
        handlePrint,
        isGenerating,
    };
};

export default useDtrPrint;
