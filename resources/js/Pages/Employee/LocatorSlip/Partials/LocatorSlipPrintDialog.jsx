"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Printer } from "lucide-react";
import { getRecordEmployeeName } from "@/lib/utils";

const csrfToken = () =>
    document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content") || "";

const filename = (name) =>
    `Locator_Slip_${(name || "Employee").replace(/\s+/g, "_")}.pdf`;

const LocatorSlipPrintDialog = ({ open, onClose, slip }) => {
    const [pdfUrl, setPdfUrl] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState("");

    const payload = useMemo(() => {
        if (!slip) return null;

        return {
            employee_name: getRecordEmployeeName(slip) || "",
            position: slip.position || slip.employee?.position || "",
            permanent_station:
                slip.permanent_station ||
                slip.employee?.station?.name ||
                slip.employee?.permanent_station ||
                "",
            purpose_of_travel: slip.purpose_of_travel || "",
            destination: slip.destination || "",
            travel_datetime: slip.travel_datetime || "",
            travel_type: slip.travel_type || "",
        };
    }, [slip]);

    useEffect(() => {
        if (!open || !payload) {
            return;
        }

        let objectUrl = "";
        const controller = new AbortController();

        const loadPdf = async () => {
            setIsGenerating(true);
            setError("");
            setPdfUrl("");

            try {
                const response = await fetch("/document-pdfs/locator-slip", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/pdf",
                        "X-CSRF-TOKEN": csrfToken(),
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error("Unable to generate locator slip PDF.");
                }

                objectUrl = URL.createObjectURL(await response.blob());
                setPdfUrl(objectUrl);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message);
                }
            } finally {
                setIsGenerating(false);
            }
        };

        loadPdf();

        return () => {
            controller.abort();
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [open, payload]);

    if (!open || !slip) return null;

    const handleDownloadPDF = () => {
        if (!pdfUrl) return;

        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = filename(payload.employee_name);
        link.click();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden p-4">
                <DialogHeader className="pb-2">
                    <DialogTitle>Locator Slip Preview</DialogTitle>
                    <DialogDescription>
                        Preview and download the locator slip before printing.
                    </DialogDescription>
                </DialogHeader>

                <div className="h-[65vh] overflow-hidden rounded-md border bg-gray-100">
                    {pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            title="Locator Slip PDF preview"
                            className="h-full w-full"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center px-4 text-center text-sm font-semibold text-slate-500">
                            {error || "Generating locator slip preview..."}
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-4 flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isGenerating}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="blue"
                        onClick={handleDownloadPDF}
                        disabled={isGenerating || !pdfUrl}
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        {isGenerating ? "Generating..." : "Download PDF"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default LocatorSlipPrintDialog;
