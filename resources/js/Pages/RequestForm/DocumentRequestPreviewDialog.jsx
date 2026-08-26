import { PDFViewer, pdf } from "@react-pdf/renderer";
import { useMemo, useState } from "react";
import { ArrowLeft, Download, Loader2 } from "lucide-react";

import LocatorSlipReport from "@/Components/Reports/LocatorSlipReport";
import TravelOrderReport from "@/Components/Reports/TravelOrderReport";
import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const employeeName = (data) =>
    [
        data.first_name,
        data.middle_name,
        data.last_name,
        data.extension_name,
    ]
        .filter(Boolean)
        .join(" ");

const safeFilenamePart = (value) =>
    (value || "Employee")
        .trim()
        .replace(/[^a-z0-9]+/gi, "_")
        .replace(/^_+|_+$/g, "");

const DocumentRequestPreviewDialog = ({
    data,
    onBack,
    onSubmit,
    open,
    processing,
    selectedStation,
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState("");
    const isLocatorSlip = data.request_type === "locator_slip";
    const name = employeeName(data);
    const reportData = useMemo(
        () => ({
            ...data,
            employee_name: name,
            permanent_station: selectedStation?.name || "",
        }),
        [data, name, selectedStation],
    );
    const ReportComponent = isLocatorSlip
        ? LocatorSlipReport
        : TravelOrderReport;
    const pdfDocument = useMemo(
        () => <ReportComponent data={reportData} />,
        [ReportComponent, reportData],
    );

    const downloadAndSubmit = async () => {
        if (processing || isGenerating) return;

        setIsGenerating(true);
        setGenerationError("");

        try {
            const blob = await pdf(pdfDocument).toBlob();
            const documentName = isLocatorSlip
                ? "Locator_Slip"
                : "Travel_Order";
            const downloadUrl = URL.createObjectURL(blob);
            const downloadLink = document.createElement("a");

            downloadLink.href = downloadUrl;
            downloadLink.download = `${documentName}_${safeFilenamePart(name)}.pdf`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();
            window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);

            onSubmit();
        } catch (error) {
            console.error("Unable to generate the document PDF.", error);
            setGenerationError(
                "The PDF could not be generated. Please try again.",
            );
        } finally {
            setIsGenerating(false);
        }
    };

    const busy = processing || isGenerating;

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen && !busy) onBack();
            }}
        >
            <DialogContent className="flex h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-6xl flex-col gap-3 overflow-hidden p-3 sm:h-auto sm:max-h-[94dvh] sm:w-[96vw] sm:gap-4 sm:p-4">
                <DialogHeader className="shrink-0">
                    <DialogTitle>
                        {isLocatorSlip ? "Locator Slip" : "Travel Order"}{" "}
                        Preview
                    </DialogTitle>
                    <DialogDescription>
                        Review the document carefully. The request is saved only
                        after the PDF is generated and downloaded.
                    </DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-hidden rounded-md border bg-slate-200">
                    <PDFViewer
                        className="h-full min-h-0 w-full border-0 sm:min-h-[55dvh]"
                        showToolbar
                    >
                        {pdfDocument}
                    </PDFViewer>
                </div>

                {generationError && (
                    <p className="text-sm font-medium text-red-600">
                        {generationError}
                    </p>
                )}

                <DialogFooter className="shrink-0 gap-2 border-t border-slate-200 pt-3 sm:gap-0 sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        disabled={busy}
                        className="w-full sm:w-auto"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button
                        type="button"
                        variant="blue"
                        onClick={downloadAndSubmit}
                        disabled={busy}
                        className="w-full sm:w-auto"
                    >
                        {busy ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        {processing
                            ? "Saving Request..."
                            : isGenerating
                              ? "Generating PDF..."
                              : "Download PDF & Submit"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DocumentRequestPreviewDialog;
